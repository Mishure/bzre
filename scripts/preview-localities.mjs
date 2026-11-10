import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rows = await prisma.property.findMany({
  where: { status: 'ACTIVE' },
  select: {
    id: true, name: true, zone: true, locality: true, street: true,
    propertyType: true, operationType: true, surface: true, rooms: true,
    price: true, currency: true,
  },
  orderBy: { id: 'asc' },
});

console.log('=== toate valorile distincte de locality ===');
const byLoc = {};
for (const p of rows) byLoc[p.locality] = (byLoc[p.locality] ?? 0) + 1;
console.table(byLoc);

console.log('\n=== proprietati din afara municipiului (locality sau zone != Buzau) ===');
const outside = rows.filter(
  (p) => /lipia|merei|magura|măgura|pietroasele|potoceni|maracineni|mărăcineni|vernesti/i.test(
    `${p.zone} ${p.locality} ${p.street}`
  )
);
for (const p of outside) {
  console.log(`#${p.id}  ${p.propertyType.padEnd(17)} ${p.operationType.padEnd(11)} ${String(p.surface).padStart(4)} mp  ${p.price} ${p.currency ?? ''}`);
  console.log(`      zone=${JSON.stringify(p.zone)}  locality=${JSON.stringify(p.locality)}  street=${JSON.stringify(p.street)}`);
}

console.log('\n=== toate TERENURILE active ===');
for (const p of rows.filter((p) => p.propertyType === 'TEREN')) {
  console.log(`#${p.id}  ${p.operationType}  ${p.surface} mp  ${p.price} ${p.currency ?? ''}  zone=${JSON.stringify(p.zone)}  locality=${JSON.stringify(p.locality)}`);
}

console.log('\n=== toate CASELE active ===');
for (const p of rows.filter((p) => p.propertyType === 'CASA')) {
  console.log(`#${p.id}  ${p.operationType}  ${p.surface} mp  ${p.price} ${p.currency ?? ''}  zone=${JSON.stringify(p.zone)}  locality=${JSON.stringify(p.locality)}`);
}

await prisma.$disconnect();
