import { PrismaClient } from '@prisma/client';
import { list } from '@vercel/blob';

const prisma = new PrismaClient();

const rows = await prisma.propertyImage.findMany({
  where: { propertyId: 27 },
  orderBy: { order: 'asc' },
  select: { id: true, url: true, order: true, isPrimary: true },
});

console.log(`=== PropertyImage in DB pentru #27: ${rows.length} ===`);
for (const r of rows) {
  const name = r.url.split('/').pop();
  console.log(`  id=${r.id} order=${r.order} primary=${r.isPrimary}  ${name}`);
}

const { blobs } = await list({ prefix: 'properties/27-' });
console.log(`\n=== blob-uri cu prefix properties/27- : ${blobs.length} ===`);
for (const b of blobs.sort((a, b2) => a.pathname.localeCompare(b2.pathname))) {
  console.log(`  ${b.pathname}  ${b.size} bytes`);
}

await prisma.$disconnect();
