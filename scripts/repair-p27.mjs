/**
 * Repairs property #27, left half-imported by the old Puppeteer importer.
 *
 * Final state: totalFloors 4, yearBuilt 1966, and 10 images in Storia's own
 * order. The zone is deliberately NOT touched — Storia does not expose the
 * neighbourhood (address.district is null) and the agency sets it by hand.
 *
 * Images: blob properties/27-2 was uploaded but never got a PropertyImage
 * row, so it is reused rather than re-downloaded. Indices 5..9 were never
 * uploaded and are fetched from Storia.
 *
 * Dry-run by default; pass --apply to write.
 */
import { PrismaClient } from '@prisma/client';
import { list, put } from '@vercel/blob';

const PROPERTY_ID = 27;
const STORIA_URL =
  'https://www.storia.ro/ro/oferta/vnd-apartament-2-camere-platou-dacia-ora-buzu-IDJbz0';
const apply = process.argv.includes('--apply');

const prisma = new PrismaClient();

// --- read Storia -----------------------------------------------------------
const res = await fetch(STORIA_URL, {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept-Language': 'ro-RO,ro;q=0.9',
  },
  cache: 'no-store',
});
if (!res.ok) throw new Error(`Storia HTTP ${res.status}`);
const html = await res.text();
const ad = JSON.parse(
  html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]
).props.pageProps.ad;

const storiaImages = (ad.images ?? []).map((i) => i.large || i.medium);
const totalFloors = parseInt(ad.target?.Building_floors_num, 10);
const yearBuilt = parseInt(ad.target?.Build_year, 10);

console.log(`Storia: ${storiaImages.length} imagini, etaje=${totalFloors}, an=${yearBuilt}`);

// --- current state ---------------------------------------------------------
const existingRows = await prisma.propertyImage.findMany({
  where: { propertyId: PROPERTY_ID },
  orderBy: { order: 'asc' },
});
const existingOrders = new Set(existingRows.map((r) => r.order));
console.log(`DB #${PROPERTY_ID}: ${existingRows.length} rânduri, order = [${[...existingOrders].join(', ')}]`);

const { blobs } = await list({ prefix: `properties/${PROPERTY_ID}-` });
const blobByIndex = new Map();
for (const b of blobs) {
  const m = b.pathname.match(/\/(\d+)-(\d+)-\d+\./);
  if (m) blobByIndex.set(parseInt(m[2], 10), b.url);
}
console.log(`Blob: indici deja încărcați = [${[...blobByIndex.keys()].sort((a, b) => a - b).join(', ')}]`);

// --- plan ------------------------------------------------------------------
const plan = [];
for (let i = 0; i < storiaImages.length; i++) {
  if (existingOrders.has(i)) continue;
  plan.push({
    order: i,
    source: blobByIndex.has(i) ? 'blob existent' : 'descarc din Storia',
    url: blobByIndex.get(i) ?? storiaImages[i],
  });
}

console.log(`\n=== plan: ${plan.length} imagini de adăugat ===`);
for (const p of plan) console.log(`  order ${p.order}  ${p.source}`);

console.log('\n=== câmpuri ===');
const before = await prisma.property.findUnique({
  where: { id: PROPERTY_ID },
  select: { totalFloors: true, yearBuilt: true, zone: true },
});
console.log(`  totalFloors ${before.totalFloors} -> ${totalFloors}`);
console.log(`  yearBuilt   ${before.yearBuilt} -> ${yearBuilt}`);
console.log(`  zone        ${JSON.stringify(before.zone)} -> NEATINS (intenționat)`);

if (!apply) {
  console.log('\n=== DRY RUN — fără --apply nu scrie nimic ===');
  await prisma.$disconnect();
  process.exit(0);
}

// --- apply -----------------------------------------------------------------
console.log('\n=== APLIC ===');

for (const p of plan) {
  let blobUrl = p.url;

  if (p.source !== 'blob existent') {
    const img = await fetch(p.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36' },
    });
    if (!img.ok) {
      console.log(`  order ${p.order}: descărcare eșuată (HTTP ${img.status}) — sar`);
      continue;
    }
    const buf = Buffer.from(await img.arrayBuffer());
    const blob = await put(
      `properties/${PROPERTY_ID}-${p.order}-${Date.now()}.jpg`,
      buf,
      { access: 'public', contentType: 'image/jpeg' }
    );
    blobUrl = blob.url;
    console.log(`  order ${p.order}: încărcat ${buf.length} bytes`);
    await new Promise((r) => setTimeout(r, 300));
  } else {
    console.log(`  order ${p.order}: reutilizez blob-ul existent`);
  }

  await prisma.propertyImage.create({
    data: {
      url: blobUrl,
      alt: `Apartament 2 camere Platou Dacia Buzău - imagine ${p.order + 1}`,
      isPrimary: false,
      order: p.order,
      propertyId: PROPERTY_ID,
    },
  });
}

await prisma.property.update({
  where: { id: PROPERTY_ID },
  data: { totalFloors, yearBuilt },
});
console.log('  câmpuri actualizate');

const after = await prisma.propertyImage.count({ where: { propertyId: PROPERTY_ID } });
console.log(`\nTotal imagini #${PROPERTY_ID}: ${after}`);

await prisma.$disconnect();
