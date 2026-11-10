import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function norm(s) {
  if (!s) return '';
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

// Zone keys to probe, passed as CLI args or defaulting to the ones left
// without a landing page.
const keys = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['dorobanti 1', 'dorobanti 2', '23 august', 'orizont', 'micro 5'];

const all = await prisma.property.findMany({
  where: { status: 'ACTIVE' },
  select: {
    id: true, name: true, zone: true, rooms: true, surface: true,
    price: true, currency: true, propertyType: true, operationType: true,
  },
  orderBy: { id: 'asc' },
});

for (const key of keys) {
  const hits = all.filter((p) => norm(p.zone).includes(key));
  console.log(`\n"${key}" (orice tip) -> ${hits.length}`);
  for (const p of hits) {
    console.log(
      `   #${p.id}  ${p.propertyType.padEnd(17)} ${p.operationType.padEnd(11)} ` +
      `${String(p.rooms ?? '-').padStart(2)} cam ${String(p.surface).padStart(4)} mp  ` +
      `${p.price} ${p.currency ?? ''}  zone="${p.zone}"`
    );
  }
}

await prisma.$disconnect();
