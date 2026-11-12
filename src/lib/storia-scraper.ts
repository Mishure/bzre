/**
 * Reads a Storia offer from the page's own `__NEXT_DATA__` payload.
 *
 * This replaced a Puppeteer scraper. Storia is a Next.js app and ships the
 * full listing as JSON in a `<script id="__NEXT_DATA__">` tag, so a plain
 * fetch gets richer and more reliable data than driving a headless browser
 * ever did. The old approach also:
 *   - downloaded a ~50 MB Chromium pack from GitHub on every cold start,
 *     inside a 60 s function;
 *   - pinned that pack at v131 while @sparticuz/chromium-min had moved to
 *     v143, a mismatch that would have failed to launch;
 *   - keyed its extraction on JSON-LD, which these pages no longer carry.
 *
 * Caveats worth knowing, both verified against a live listing:
 *   - the payload has NO currency field, so it is inferred from the rendered
 *     price (see detectCurrency);
 *   - `location.address` is entirely null and `breadcrumbs` is empty, so the
 *     neighbourhood cannot be derived reliably. `zone` is returned empty and
 *     has to be set by hand in admin.
 */

export interface StoriaPropertyData {
  title: string
  price: number
  currency: string // EUR or RON
  propertyType: string // APARTAMENT, CASA, TEREN, SPATIU_COMERCIAL
  operationType: string // VANZARE, INCHIRIERE
  locality: string
  zone: string
  street?: string // Adresa completă extrasă din titlu
  latitude?: number | null // Coordonată GPS
  longitude?: number | null // Coordonată GPS
  surface: number
  rooms?: number
  floor?: number
  totalFloors?: number
  description: string
  features: string[]
  imageUrls: string[]
  storiaUrl: string
  storiaId: string
  // Additional characteristics
  heating?: string // Încălzire
  condition?: string // Stare
  availableFrom?: string // Liber de la
  deposit?: string // Garanție
  buildingType?: string // Tip clădire
  buildingMaterial?: string // Material construcție
  yearBuilt?: number // An construcție
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/** Storia enum values, mapped to what the site displays in Romanian. */
const HEATING: Record<string, string> = {
  gas: 'centrală pe gaz',
  urban: 'termoficare',
  electric: 'încălzire electrică',
  boiler_room: 'centrală de cartier',
  tiled_stove: 'sobă de teracotă',
  other: 'altă sursă',
}

const BUILDING_TYPE: Record<string, string> = {
  block: 'bloc',
  tenement: 'imobil',
  house: 'casă',
  apartment_building: 'bloc de apartamente',
  detached_house: 'casă individuală',
  infill: 'bloc',
  loft: 'loft',
  ribbon_house: 'casă înșiruită',
}

const BUILDING_MATERIAL: Record<string, string> = {
  brick: 'cărămidă',
  concrete_plate: 'panouri prefabricate',
  concrete: 'beton',
  breezeblock: 'BCA',
  hydroton: 'cărămidă poroasă',
  wood: 'lemn',
  silikat: 'cărămidă silico-calcară',
  cellular_concrete: 'beton celular',
  reinforced_concrete: 'beton armat',
  other: 'alt material',
}

const CONSTRUCTION_STATUS: Record<string, string> = {
  ready_to_use: 'gata de mutare',
  to_completion: 'de finalizat',
  to_renovation: 'necesită renovare',
}

const WINDOWS: Record<string, string> = {
  aluminium: 'tâmplărie aluminiu',
  plastic: 'tâmplărie PVC',
  wooden: 'tâmplărie lemn',
}

const EQUIPMENT: Record<string, string> = {
  furniture: 'mobilat',
  tv: 'TV',
  washing_machine: 'mașină de spălat',
  dishwasher: 'mașină de spălat vase',
  fridge: 'frigider',
  stove: 'plită',
  oven: 'cuptor',
}

const EXTRAS: Record<string, string> = {
  air_conditioning: 'aer condiționat',
  balcony: 'balcon',
  basement: 'boxă',
  garage: 'garaj',
  lift: 'lift',
  terrace: 'terasă',
  garden: 'grădină',
  two_storey: 'două niveluri',
  separate_kitchen: 'bucătărie separată',
  usable_room: 'cămară',
  non_smokers_only: 'doar nefumători',
}

function extractStoriaId(url: string): string {
  // Extract ID from URL like: https://www.storia.ro/ro/oferta/...-IDFqlh
  const match = url.match(/ID([A-Za-z0-9]+)/)
  return match ? match[1] : ''
}

function mapPropertyType(storiaType: string): string {
  const type = (storiaType || '').toLowerCase()
  // Check in order of specificity (most specific first)
  if (type.includes('teren')) return 'TEREN'
  if (type.includes('casa') || type.includes('casă')) return 'CASA'
  if (type.includes('comercial') || type.includes('spatiu') || type.includes('spațiu'))
    return 'SPATIU_COMERCIAL'
  if (type.includes('apartament') || type.includes('garsonier')) return 'APARTAMENT'
  return 'APARTAMENT'
}

function mapOperationType(storiaOperation: string): string {
  const operation = (storiaOperation || '').toLowerCase()
  if (operation.includes('inchiriere') || operation.includes('închiriere')) return 'INCHIRIERE'
  return 'VANZARE'
}

/** Storia's `target` fields are sometimes scalars, sometimes single-element arrays. */
function first(value: unknown): string {
  if (Array.isArray(value)) return value.length ? String(value[0]) : ''
  return value === null || value === undefined ? '' : String(value)
}

function all(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  return value === null || value === undefined ? [] : [String(value)]
}

function toNumber(value: unknown): number | undefined {
  const n = parseFloat(first(value).replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

/** "floor_3" -> 3, "ground_floor" -> 0, "garret"/unknown -> undefined. */
function parseFloorNo(value: unknown): number | undefined {
  const raw = first(value)
  if (!raw) return undefined
  if (raw === 'ground_floor') return 0
  const m = raw.match(/^floor_(\d+)$/)
  if (m) return parseInt(m[1], 10)
  const n = parseInt(raw, 10)
  return Number.isFinite(n) ? n : undefined
}

/**
 * The payload carries no currency, so read it off the rendered price.
 * Storia shows sale prices as "61 500 €" and rents often in "lei".
 * Defaults to EUR, which is what Romanian sale listings overwhelmingly use.
 */
function detectCurrency(html: string, price: number): string {
  // Build the grouped form Storia renders, e.g. 61500 -> "61 500", and look
  // for a currency marker right after it. The separator is a non-breaking or
  // thin space depending on locale, so accept any whitespace.
  const grouped = String(Math.round(price)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    '\\s*'
  )
  const near = new RegExp(`${grouped}\\s*(€|EUR|lei|RON)`, 'i')
  const m = html.match(near)
  if (m) {
    const unit = m[1].toLowerCase()
    return unit === 'lei' || unit === 'ron' ? 'RON' : 'EUR'
  }
  return 'EUR'
}

function stripHtml(html: string): string {
  return (html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function translate(values: string[], dict: Record<string, string>): string[] {
  return values.map((v) => dict[v] ?? v.replace(/_/g, ' '))
}

export async function scrapeStoriaProperty(url: string): Promise<StoriaPropertyData> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
    },
    // Storia pages are static enough; never serve a stale copy to the importer.
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Storia a răspuns cu HTTP ${res.status} pentru ${url}`)
  }

  const html = await res.text()

  // Storia adds crossorigin="anonymous" to this tag, so match attributes loosely.
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) {
    throw new Error(
      'Nu am găsit __NEXT_DATA__ în pagina Storia. Probabil s-a schimbat structura paginii sau URL-ul nu este o ofertă.'
    )
  }

  let ad: Record<string, any>
  try {
    ad = JSON.parse(match[1])?.props?.pageProps?.ad
  } catch (error) {
    throw new Error(
      `__NEXT_DATA__ nu a putut fi parsat: ${error instanceof Error ? error.message : 'eroare necunoscută'}`
    )
  }

  if (!ad) {
    throw new Error(
      'Pagina Storia nu conține datele ofertei (props.pageProps.ad lipsește). Verifică dacă anunțul este încă activ.'
    )
  }

  if (ad.status && ad.status !== 'active') {
    throw new Error(`Anunțul Storia nu este activ (status: ${ad.status})`)
  }

  const target = ad.target ?? {}

  const price = toNumber(target.Price)
  const surface = toNumber(target.Area)
  if (price === undefined) throw new Error('Anunțul Storia nu are preț')
  if (surface === undefined) throw new Error('Anunțul Storia nu are suprafață')

  // Locality: address is null on these pages, so fall back to the
  // reverse-geocoded location chain, most specific entry last.
  const geo: Array<{ name?: string; locationLevel?: string }> =
    ad.location?.reverseGeocoding?.locations ?? []
  const locality =
    ad.location?.address?.city?.name ||
    geo[geo.length - 1]?.name ||
    'Buzau'

  const features = [
    ...translate(all(target.Equipment_types), EQUIPMENT),
    ...translate(all(target.Extras_types), EXTRAS),
    ...translate(all(target.Windows_type), WINDOWS),
  ].filter(Boolean)

  const imageUrls: string[] = (ad.images ?? [])
    .map((img: Record<string, string>) => img.large || img.medium || img.small)
    .filter(Boolean)

  return {
    title: ad.title ?? '',
    price,
    currency: detectCurrency(html, price),
    propertyType: mapPropertyType(first(target.ProperType)),
    operationType: mapOperationType(first(target.OfferType)),
    locality,
    // Not derivable: address.district and breadcrumbs are empty on Storia
    // offer pages. Set the zone by hand in admin after import.
    zone: ad.location?.address?.district?.name ?? '',
    street: ad.location?.address?.street?.name ?? '',
    latitude: ad.location?.coordinates?.latitude ?? null,
    longitude: ad.location?.coordinates?.longitude ?? null,
    surface,
    rooms: toNumber(target.Rooms_num),
    floor: parseFloorNo(target.Floor_no),
    totalFloors: toNumber(target.Building_floors_num),
    description: stripHtml(ad.description ?? ''),
    features,
    imageUrls,
    storiaUrl: url,
    storiaId: String(ad.id ?? extractStoriaId(url)),
    heating: HEATING[first(target.Heating)] ?? first(target.Heating) ?? undefined,
    condition:
      CONSTRUCTION_STATUS[first(target.Construction_status)] ??
      first(target.Construction_status) ??
      undefined,
    buildingType: BUILDING_TYPE[first(target.Building_type)] ?? first(target.Building_type) ?? undefined,
    buildingMaterial:
      BUILDING_MATERIAL[first(target.Building_material)] ??
      first(target.Building_material) ??
      undefined,
    yearBuilt: toNumber(target.Build_year),
  }
}

// Scrape multiple properties
export async function scrapeMultipleStoriaProperties(
  urls: string[]
): Promise<StoriaPropertyData[]> {
  const results: StoriaPropertyData[] = []

  for (const url of urls) {
    try {
      const data = await scrapeStoriaProperty(url)
      results.push(data)

      // Add delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error)
    }
  }

  return results
}
