import puppeteer, { Browser, Page } from 'puppeteer'

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

let browser: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    })
  }
  return browser
}

export async function closeBrowser() {
  if (browser) {
    await browser.close()
    browser = null
  }
}

function extractStoriaId(url: string): string {
  // Extract ID from URL like: https://www.storia.ro/ro/oferta/...-IDFqlh
  const match = url.match(/ID([A-Za-z0-9]+)/)
  return match ? match[1] : ''
}

function mapPropertyType(storiaType: string): string {
  const type = storiaType.toLowerCase()
  // Check in order of specificity (most specific first)
  if (type.includes('teren')) return 'TEREN'
  if (type.includes('casa') || type.includes('casă')) return 'CASA'
  if (type.includes('comercial') || type.includes('spatiu') || type.includes('spațiu')) return 'SPATIU_COMERCIAL'
  if (type.includes('apartament')) return 'APARTAMENT'
  return 'APARTAMENT'
}

function mapOperationType(storiaOperation: string): string {
  const operation = storiaOperation.toLowerCase()
  if (operation.includes('inchiriere') || operation.includes('închiriere')) return 'INCHIRIERE'
  return 'VANZARE'
}

export async function scrapeStoriaProperty(url: string): Promise<StoriaPropertyData> {
  const browserInstance = await getBrowser()
  const page: Page = await browserInstance.newPage()

  // Forward browser console to Node.js console
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    if (type === 'log') console.log('Browser:', text)
    else if (type === 'error') console.error('Browser Error:', text)
  })

  try {
    // Set user agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    // Navigate to the Storia page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    // Wait for content to load
    await page.waitForSelector('h1', { timeout: 10000 })

    // Save HTML for debugging
    const html = await page.content()
    const fs = require('fs')
    fs.writeFileSync('/tmp/storia-page.html', html)
    console.log('Saved page HTML to /tmp/storia-page.html')

    // Extract data using page.evaluate
    const propertyData = await page.evaluate(() => {
      // Helper to extract meta content
      const getMetaContent = (name: string): string => {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
        return meta?.getAttribute('content') || ''
      }

      // Extract from meta tags first (most reliable for Storia)
      const metaDescription = getMetaContent('description')
      const metaTitle = getMetaContent('og:title') || document.querySelector('title')?.textContent || ''

      console.log('Meta description:', metaDescription)
      console.log('Meta title:', metaTitle)

      // Try to extract from JSON-LD first (most reliable)
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]')
      let jsonData: any = null

      console.log(`Found ${jsonLdScripts.length} JSON-LD scripts`)

      // Try all JSON-LD scripts to find property data
      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent || '')
          console.log('JSON-LD @type:', data['@type'])

          // Check multiple possible types
          if (data['@type'] === 'Apartment' ||
              data['@type'] === 'House' ||
              data['@type'] === 'Product' ||
              data['@type'] === 'RealEstateListing' ||
              data['@type'] === 'Place') {
            jsonData = data
            console.log('Found property JSON-LD')
            break
          }

          // Sometimes Storia nests the data in @graph
          if (data['@graph'] && Array.isArray(data['@graph'])) {
            for (const item of data['@graph']) {
              if (item['@type'] === 'Apartment' ||
                  item['@type'] === 'House' ||
                  item['@type'] === 'Product' ||
                  item['@type'] === 'RealEstateListing') {
                jsonData = item
                console.log('Found property JSON-LD in @graph')
                break
              }
            }
          }
        } catch (e) {
          console.error('Error parsing JSON-LD:', e)
        }
      }

      // Helper function to get text content safely
      const getText = (selector: string): string => {
        const element = document.querySelector(selector)
        return element?.textContent?.trim() || ''
      }

      // Helper function to get all text contents
      const getTexts = (selector: string): string[] => {
        const elements = document.querySelectorAll(selector)
        return Array.from(elements).map(el => el.textContent?.trim() || '').filter(Boolean)
      }

      // Extract title
      let title = ''
      if (jsonData?.name) {
        title = jsonData.name
      } else {
        title = getText('h1') || getText('[data-cy="ad.top-information.title"]')
      }

      // Extract price and currency
      let price = 0
      let currency = 'RON' // Default to RON

      if (jsonData?.offers?.price) {
        price = parseFloat(jsonData.offers.price)
        // Try to get currency from JSON-LD
        if (jsonData?.offers?.priceCurrency) {
          currency = jsonData.offers.priceCurrency === 'EUR' ? 'EUR' : 'RON'
        }
      } else {
        const priceText = getText('[data-cy="ad.top-information.price"]') ||
                         getText('[aria-label*="Preț"]') ||
                         getText('strong[class*="price"]')
        const priceMatch = priceText.match(/[\d\s.]+/)
        price = priceMatch ? parseFloat(priceMatch[0].replace(/[\s.]/g, '')) : 0

        // Extract currency from price text (look for EUR, € or RON, lei)
        if (priceText.includes('EUR') || priceText.includes('€')) {
          currency = 'EUR'
          console.log('Detected EUR currency from price text')
        } else if (priceText.includes('RON') || priceText.includes('lei')) {
          currency = 'RON'
          console.log('Detected RON currency from price text')
        }
      }

      console.log('Extracted price:', price, currency)

      // Extract property type and operation type from breadcrumbs or URL
      const breadcrumbs = getTexts('[data-cy="breadcrumb-item"]')
      // Search for property type in order of specificity (most specific first)
      // This prevents "Apartamente" category from overriding specific "Casa" or "Teren" types
      let propertyType = breadcrumbs.find(b => b.toLowerCase().includes('teren'))
      if (!propertyType) {
        propertyType = breadcrumbs.find(b =>
          b.toLowerCase().includes('casa') ||
          b.toLowerCase().includes('casă')
        )
      }
      if (!propertyType) {
        propertyType = breadcrumbs.find(b => b.toLowerCase().includes('apartament'))
      }
      propertyType = propertyType || 'Apartament'

      // Try to extract operation type from multiple sources
      let operationType = breadcrumbs.find(b =>
        b.toLowerCase().includes('vanzare') ||
        b.toLowerCase().includes('inchiriere') ||
        b.toLowerCase().includes('închiriere')
      )

      // If not found in breadcrumbs, check the title
      if (!operationType && title) {
        if (title.toLowerCase().includes('inchiriez') ||
            title.toLowerCase().includes('inchiriere') ||
            title.toLowerCase().includes('închiriere')) {
          operationType = 'Închiriere'
          console.log('Detected operation type from title: Închiriere')
        } else if (title.toLowerCase().includes('vand') ||
                   title.toLowerCase().includes('vanzare') ||
                   title.toLowerCase().includes('vânzare')) {
          operationType = 'Vânzare'
          console.log('Detected operation type from title: Vânzare')
        }
      }

      // Fallback: check URL
      if (!operationType) {
        operationType = window.location.href.includes('inchiriere') ? 'Închiriere' : 'Vânzare'
        console.log('Detected operation type from URL:', operationType)
      }

      // Extract location
      let locality = 'Buzau'
      let zone = ''

      if (jsonData?.address) {
        locality = jsonData.address.addressLocality || 'Buzau'
        zone = jsonData.address.streetAddress || ''
      } else {
        const locationText = getText('[data-cy="ad.top-information.location"]') ||
                            getText('[aria-label*="Localizare"]')
        const locationParts = locationText.split(',').map(s => s.trim())
        locality = locationParts[locationParts.length - 1] || 'Buzau'
        zone = locationParts[0] || ''
      }

      // Extract zone from title if still empty
      if (!zone && metaTitle) {
        // "Inchiriez apartament 2 camere zona Crang judetul Buzau"
        const zoneMatch = metaTitle.match(/zona\s+([^,\-]+)/i)
        if (zoneMatch) {
          zone = zoneMatch[1].trim()
          console.log('Extracted zone from metaTitle:', zone)
        }
      }

      // Also try to extract from actual page title if zone still empty
      if (!zone) {
        const pageTitle = document.querySelector('title')?.textContent || title
        const zoneMatch = pageTitle.match(/zona\s+([^,\-]+)/i)
        if (zoneMatch) {
          zone = zoneMatch[1].trim()
          console.log('Extracted zone from page title:', zone)
        }
      }

      // Extract address (street) from title by removing transaction type and property type
      let street = ''
      if (title) {
        // "Inchiriez apartament 2 camere zona Crang judetul Buzau"
        let addressText = title

        // Remove transaction type (inchiriez, vand, vanzare, inchiriere, etc.)
        addressText = addressText.replace(/^(inchiriez|vand|vanzare|inchiriere|oferta|ofer spre|de)\s+/i, '')

        // Remove property type patterns
        addressText = addressText.replace(/^(apartament|casa|teren|spatiu comercial|garsoniera|vila|birou)\s+(\d+\s+camere?|\d+\s*mp|\d+\s*m²)?\s*/i, '')
        addressText = addressText.replace(/^(apartament|casa|teren|spatiu comercial|garsoniera|vila|birou)\s*/i, '')

        // Clean up and trim
        street = addressText.trim()

        if (street) {
          console.log('Extracted address from title:', street)
        }
      }

      // Extract GPS coordinates from GraphQL data in page
      let latitude: number | null = null
      let longitude: number | null = null

      try {
        // Search for coordinates in page HTML (GraphQL response data)
        const bodyHTML = document.body.innerHTML
        const coordsMatch = bodyHTML.match(/"coordinates":\s*\{[^}]*"latitude":\s*([0-9.]+)[^}]*"longitude":\s*([0-9.]+)/i)

        if (coordsMatch) {
          latitude = parseFloat(coordsMatch[1])
          longitude = parseFloat(coordsMatch[2])
          console.log('Extracted GPS coordinates:', latitude, longitude)
        } else {
          console.log('GPS coordinates not found in page')
        }
      } catch (e) {
        console.error('Error extracting GPS coordinates:', e)
      }

      // Extract characteristics from JSON-LD or aria-labels
      let surface = 0
      let rooms = 0
      let floor = 0
      let totalFloors = 0

      if (jsonData?.floorSize?.value) {
        surface = parseFloat(jsonData.floorSize.value)
        console.log('Extracted surface from JSON-LD:', surface)
      }
      if (jsonData?.numberOfRooms) {
        rooms = parseInt(jsonData.numberOfRooms)
        console.log('Extracted rooms from JSON-LD:', rooms)
      }

      // Extract from meta description if JSON-LD failed
      if (metaDescription) {
        // Extract rooms: "cu 2 in" or "2 camere"
        if (rooms === 0) {
          const roomsMatch = metaDescription.match(/cu\s+(\d+)\s+(?:in|camere)|(\d+)\s+camere/)
          if (roomsMatch) {
            rooms = parseInt(roomsMatch[1] || roomsMatch[2])
            console.log('Extracted rooms from meta:', rooms)
          }
        }

        // Extract surface: "are 29 m²" or "29 m²"
        if (surface === 0) {
          const surfaceMatch = metaDescription.match(/(\d+)\s*m[²2]/)
          if (surfaceMatch) {
            surface = parseInt(surfaceMatch[1])
            console.log('Extracted surface from meta:', surface)
          }
        }

        // Extract floor: "la etajul 1"
        if (floor === 0) {
          const floorMatch = metaDescription.match(/etajul\s+(\d+)/)
          if (floorMatch) {
            floor = parseInt(floorMatch[1])
            console.log('Extracted floor from meta:', floor)
          }
        }
      }

      // Extract from title if still missing
      if (rooms === 0 && metaTitle) {
        const roomsMatch = metaTitle.match(/(\d+)\s+camere/)
        if (roomsMatch) {
          rooms = parseInt(roomsMatch[1])
          console.log('Extracted rooms from title:', rooms)
        }
      }

      // Try multiple methods to extract characteristics
      console.log('Looking for characteristics...')

      // Method 1: aria-labels
      const characteristicItems = document.querySelectorAll('[aria-label*="Supraf"], [aria-label*="Camer"], [aria-label*="Etaj"], [aria-label*="camer"]')
      console.log('Found characteristic items:', characteristicItems.length)

      characteristicItems.forEach(item => {
        const label = item.getAttribute('aria-label') || ''
        const text = item.textContent?.trim() || ''
        console.log('Checking item:', label, text)

        if ((label.includes('Supraf') || label.includes('supraf') || text.includes('m²')) && surface === 0) {
          const match = text.match(/(\d+)/)
          if (match) {
            surface = parseInt(match[1])
            console.log('Found surface:', surface)
          }
        }

        if ((label.toLowerCase().includes('camer') || text.includes('camera') || text.includes('camere')) && rooms === 0) {
          const match = text.match(/(\d+)/)
          if (match) {
            rooms = parseInt(match[1])
            console.log('Found rooms:', rooms)
          }
        }

        if (label.includes('Etaj') || label.includes('etaj')) {
          const floorMatch = text.match(/(\d+)/)
          if (floorMatch && floor === 0) {
            floor = parseInt(floorMatch[1])
            console.log('Found floor:', floor)
          }

          const totalMatch = text.match(/din\s+(\d+)/)
          if (totalMatch && totalFloors === 0) {
            totalFloors = parseInt(totalMatch[1])
            console.log('Found total floors:', totalFloors)
          }
        }
      })

      // Method 2: Try data-cy attributes (Storia uses these)
      if (surface === 0) {
        const surfaceEl = document.querySelector('[data-cy*="surface"], [data-testid*="surface"]')
        if (surfaceEl) {
          const match = surfaceEl.textContent?.match(/(\d+)/)
          if (match) {
            surface = parseInt(match[1])
            console.log('Found surface from data-cy:', surface)
          }
        }
      }

      if (rooms === 0) {
        const roomsEl = document.querySelector('[data-cy*="rooms"], [data-testid*="rooms"]')
        if (roomsEl) {
          const match = roomsEl.textContent?.match(/(\d+)/)
          if (match) {
            rooms = parseInt(match[1])
            console.log('Found rooms from data-cy:', rooms)
          }
        }
      }

      // Method 3: Try looking in all list items that might contain characteristics
      if (surface === 0 || rooms === 0) {
        const listItems = document.querySelectorAll('li, div[class*="param"], div[class*="characteristic"]')
        listItems.forEach(item => {
          const text = item.textContent?.toLowerCase() || ''

          if (text.includes('m²') || text.includes('suprafață') || text.includes('suprafata')) {
            if (surface === 0) {
              const match = text.match(/(\d+)\s*m/)
              if (match) {
                surface = parseInt(match[1])
                console.log('Found surface from list:', surface)
              }
            }
          }

          if ((text.includes('camer') && !text.includes('cameră de')) || text.includes('room')) {
            if (rooms === 0) {
              const match = text.match(/(\d+)\s*camer/)
              if (match) {
                rooms = parseInt(match[1])
                console.log('Found rooms from list:', rooms)
              }
            }
          }
        })
      }

      // Extract description from Storia's description section
      let description = ''

      // Method 1: Try the main description area (most reliable)
      const descP = document.querySelector('[data-cy="adPageAdDescription"] p')
      if (descP) {
        description = descP.textContent?.trim() || ''
        console.log('Extracted description from adPageAdDescription:', description.length, 'chars')
      }

      // Method 2: Try alternative selectors
      if (!description) {
        description = getText('[data-cy="ad.description.text"]') ||
                     getText('[data-cy="ad.description"]') ||
                     ''
        if (description) {
          console.log('Extracted description from alternative selector:', description.length, 'chars')
        }
      }

      // Method 3: If still no description, use meta description as fallback
      if (!description || description.length < 20) {
        if (metaDescription && metaDescription.length > 0) {
          description = metaDescription
          console.log('Using meta description as fallback:', description.length, 'chars')
        }
      }

      console.log('Final description length:', description?.length || 0, 'chars')

      // Extract features/amenities
      const features: string[] = []

      // Method 1: Look for features in Storia's "Informații suplimentare" section
      const featureSpans = document.querySelectorAll('.e1mm5aqc4, span.css-axw7ok')
      featureSpans.forEach(el => {
        const text = el.textContent?.trim()
        if (text && !text.includes('svg') && text.length > 1) {
          features.push(text)
        }
      })

      console.log('Found features from spans:', features.length)

      // Method 2: Try data-cy selectors
      if (features.length === 0) {
        const featureElements = document.querySelectorAll('[data-cy="ad.additional-information"] li, [data-cy="ad.features"] li')
        featureElements.forEach(el => {
          const text = el.textContent?.trim()
          if (text) features.push(text)
        })
        console.log('Found features from data-cy:', features.length)
      }

      // Method 3: Extract from meta description as fallback
      if (features.length === 0 && metaDescription) {
        // "principalele calitati ale apartamentului sunt debara, internet, cablu tv"
        const featuresMatch = metaDescription.match(/(?:calitati|caracteristici).*?sunt\s+([^.]+)/i)
        if (featuresMatch) {
          const featuresList = featuresMatch[1].split(',').map(f => f.trim()).filter(Boolean)
          features.push(...featuresList)
          console.log('Extracted features from meta:', features.length)
        }
      }

      console.log('Total features extracted:', features)

      // Extract additional property characteristics from Storia's detail items
      let heating = ''
      let condition = ''
      let availableFrom = ''
      let deposit = ''
      let buildingType = ''
      let buildingMaterial = ''
      let yearBuilt = 0

      console.log('=== EXTRACTING ADDITIONAL CHARACTERISTICS ===')

      // Storia uses ItemGridContainer divs with two child divs: label and value
      const detailContainers = document.querySelectorAll('.css-1xw0jqp, [data-sentry-element="ItemGridContainer"]')
      console.log('Found detail containers:', detailContainers.length)

      detailContainers.forEach((container, index) => {
        const children = Array.from(container.children)
        if (children.length >= 2) {
          const labelDiv = children[0] as HTMLElement
          const valueDiv = children[1] as HTMLElement

          const label = labelDiv?.textContent?.trim().replace(':', '').toLowerCase() || ''
          const value = valueDiv?.textContent?.trim() || ''

          console.log(`Detail ${index + 1}: "${label}" = "${value}"`)

          // Încălzire (Heating)
          if (label.includes('încălzire') || label.includes('incalzire')) {
            heating = value
            console.log('✓ Extracted heating:', heating)
          }

          // Stare (Condition)
          if (label.includes('stare')) {
            condition = value
            console.log('✓ Extracted condition:', condition)
          }

          // Liber de la (Available from)
          if (label.includes('liber de la')) {
            availableFrom = value
            console.log('✓ Extracted available from:', availableFrom)
          }

          // Garanție (Deposit)
          if (label.includes('garanție') || label.includes('garantie')) {
            deposit = value
            console.log('✓ Extracted deposit:', deposit)
          }

          // Tip clădire (Building type)
          if (label.includes('tip clădire') || label.includes('tip cladire') || label.includes('tip construcție')) {
            buildingType = value
            console.log('✓ Extracted building type:', buildingType)
          }

          // Material (Building material)
          if (label.includes('material')) {
            buildingMaterial = value
            console.log('✓ Extracted building material:', buildingMaterial)
          }

          // An construcție (Year built)
          if (label.includes('an construcție') || label.includes('an constructie')) {
            const yearMatch = value.match(/19\d{2}|20\d{2}/)
            if (yearMatch) {
              yearBuilt = parseInt(yearMatch[0])
              console.log('✓ Extracted year built:', yearBuilt)
            }
          }
        }
      })

      console.log('=== ADDITIONAL CHARACTERISTICS EXTRACTED ===')
      console.log('Heating:', heating || 'N/A')
      console.log('Condition:', condition || 'N/A')
      console.log('Available from:', availableFrom || 'N/A')
      console.log('Deposit:', deposit || 'N/A')
      console.log('Building type:', buildingType || 'N/A')
      console.log('Building material:', buildingMaterial || 'N/A')
      console.log('Year built:', yearBuilt || 'N/A')
      console.log('==========================================')

      // Extract image URLs
      const imageUrls: string[] = []

      // Try JSON-LD images first
      if (jsonData?.image) {
        const images = Array.isArray(jsonData.image) ? jsonData.image : [jsonData.image]
        images.forEach((img: any) => {
          const url = typeof img === 'string' ? img : img.url
          if (url && !imageUrls.includes(url)) {
            imageUrls.push(url)
          }
        })
      }

      console.log('Found images from JSON-LD:', imageUrls.length)

      // Try to extract ALL images from page (not just first 2)
      // Look for images in picture elements (Storia uses these)
      const pictureElements = document.querySelectorAll('picture img, picture source')
      pictureElements.forEach(el => {
        const src = el.getAttribute('src') || el.getAttribute('srcset') || el.getAttribute('data-src')
        if (src) {
          // Extract the URL from srcset if needed (take first one)
          const url = src.split(' ')[0].split(',')[0]
          if (url && url.includes('apollo.olxcdn.com') && !url.includes('placeholder') && !url.includes('logo')) {
            // Get high-res version
            const highResUrl = url.replace(/;s=\d+x\d+/, ';s=1280x1024')
            if (!imageUrls.includes(highResUrl)) {
              imageUrls.push(highResUrl)
            }
          }
        }
      })

      console.log('Found images from picture elements:', imageUrls.length)

      // Also try aria-label images (Storia carousel uses these)
      const ariaImages = document.querySelectorAll('[aria-label*="Imagine"]')
      ariaImages.forEach(el => {
        const img = el.querySelector('img')
        if (img) {
          const src = img.getAttribute('src') || img.getAttribute('data-src')
          if (src && src.includes('apollo.olxcdn.com') && !src.includes('placeholder')) {
            const highResUrl = src.replace(/;s=\d+x\d+/, ';s=1280x1024')
            if (!imageUrls.includes(highResUrl)) {
              imageUrls.push(highResUrl)
            }
          }
        }
      })

      console.log('Total images found:', imageUrls.length)

      // Fallback: try gallery images (old method)
      if (imageUrls.length < 3) {
        const galleryImages = document.querySelectorAll('[data-cy="image-gallery"] img, img[src*="storia"], img[src*="otodom"], img[alt*="Imagine"]')
        galleryImages.forEach(img => {
          const src = img.getAttribute('src') || img.getAttribute('data-src')
          if (src && !src.includes('placeholder') && !src.includes('logo') && !src.includes('icon') && !imageUrls.includes(src)) {
            // Get high-res version if possible
            const highResSrc = src.replace(/\/small\//, '/large/').replace(/\/medium\//, '/large/').replace(/;s=\d+x\d+/, ';s=1280x1024')
            imageUrls.push(highResSrc)
          }
        })
        console.log('After fallback, total images:', imageUrls.length)
      }

      const result = {
        title,
        price,
        currency,
        propertyType,
        operationType,
        locality,
        zone,
        street,
        latitude,
        longitude,
        surface,
        rooms,
        floor,
        totalFloors,
        description,
        features,
        imageUrls,
        heating,
        condition,
        availableFrom,
        deposit,
        buildingType,
        buildingMaterial,
        yearBuilt,
      }

      console.log('=== FINAL EXTRACTED DATA ===')
      console.log('Title:', title)
      console.log('Price:', price, currency)
      console.log('Surface:', surface, 'm²')
      console.log('Rooms:', rooms)
      console.log('Floor:', floor)
      console.log('Total Floors:', totalFloors)
      console.log('GPS Coordinates:', latitude && longitude ? `${latitude}, ${longitude}` : 'Not found')
      console.log('Zone:', zone)
      console.log('Street:', street)
      console.log('Locality:', locality)
      console.log('Description length:', description.length, 'chars')
      console.log('Features count:', features.length)
      console.log('Images count:', imageUrls.length)
      console.log('===========================')

      return result
    })

    // Map the data to our format
    const mappedData: StoriaPropertyData = {
      title: propertyData.title,
      price: propertyData.price,
      currency: propertyData.currency || 'RON',
      propertyType: mapPropertyType(propertyData.propertyType),
      operationType: mapOperationType(propertyData.operationType),
      locality: propertyData.locality || 'Buzau',
      zone: propertyData.zone,
      street: propertyData.street || undefined,
      latitude: propertyData.latitude || undefined,
      longitude: propertyData.longitude || undefined,
      surface: propertyData.surface,
      rooms: propertyData.rooms || undefined,
      floor: propertyData.floor || undefined,
      totalFloors: propertyData.totalFloors || undefined,
      description: propertyData.description,
      features: propertyData.features,
      imageUrls: propertyData.imageUrls,
      storiaUrl: url,
      storiaId: extractStoriaId(url),
      heating: propertyData.heating || undefined,
      condition: propertyData.condition || undefined,
      availableFrom: propertyData.availableFrom || undefined,
      deposit: propertyData.deposit || undefined,
      buildingType: propertyData.buildingType || undefined,
      buildingMaterial: propertyData.buildingMaterial || undefined,
      yearBuilt: propertyData.yearBuilt || undefined,
    }

    return mappedData

  } catch (error) {
    console.error('Error scraping Storia property:', error)
    throw new Error(`Failed to scrape Storia property: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    await page.close()
  }
}

// Scrape multiple properties
export async function scrapeMultipleStoriaProperties(urls: string[]): Promise<StoriaPropertyData[]> {
  const results: StoriaPropertyData[] = []

  for (const url of urls) {
    try {
      const data = await scrapeStoriaProperty(url)
      results.push(data)

      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error)
    }
  }

  return results
}
