import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Properties whose zone is empty or whitespace-only: invisible to every
// zone filter and to the per-neighbourhood landing pages.
const rows = await prisma.property.findMany({
  where: {
    status: 'ACTIVE',
    OR: [{ zone: null }, { zone: '' }, { zone: { equals: ' ' } }],
  },
  select: {
    id: true,
    name: true,
    street: true,
    locality: true,
    zone: true,
    price: true,
    currency: true,
    surface: true,
    rooms: true,
    propertyType: true,
    operationType: true,
    createdAt: true,
  },
  orderBy: { id: 'asc' },
});

console.log(`${rows.length} proprietati ACTIVE fara zona\n`);

for (const p of rows) {
  console.log(`#${p.id}  ${p.name}`);
  console.log(`     zone=${JSON.stringify(p.zone)}  strada=${JSON.stringify(p.street)}  localitate=${JSON.stringify(p.locality)}`);
  console.log(`     ${p.propertyType} / ${p.operationType} — ${p.price} ${p.currency ?? ''} — ${p.surface} mp — ${p.rooms ?? '-'} camere`);
  console.log(`     adaugata ${p.createdAt.toISOString().slice(0, 10)}`);
  console.log(`     https://www.camimob.ro/properties/${p.id}`);
  console.log(`     admin: https://www.camimob.ro/admin/properties/${p.id}/edit\n`);
}

await prisma.$disconnect();
