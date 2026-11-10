import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rows = await prisma.property.findMany({
  where: { status: 'ACTIVE', operationType: 'INCHIRIERE' },
  select: {
    id: true, name: true, propertyType: true, rooms: true, surface: true,
    price: true, currency: true, zone: true, floor: true, totalFloors: true,
  },
  orderBy: { id: 'asc' },
});

console.log(`${rows.length} proprietati ACTIVE de inchiriat\n`);
for (const p of rows) {
  console.log(`#${p.id}  ${p.propertyType.padEnd(17)} ${String(p.rooms ?? '-').padStart(2)} cam  ${String(p.surface).padStart(4)} mp  ${String(p.price).padStart(6)} ${(p.currency ?? '').padEnd(3)}  et ${p.floor ?? '-'}/${p.totalFloors ?? '-'}  ${p.zone}`);
}

const byType = {};
const byRooms = {};
for (const p of rows) {
  byType[p.propertyType] = (byType[p.propertyType] ?? 0) + 1;
  byRooms[p.rooms ?? '-'] = (byRooms[p.rooms ?? '-'] ?? 0) + 1;
}
console.log('\npe tip:   ', byType);
console.log('pe camere:', byRooms);

const rents = rows.filter((p) => p.currency === 'RON').map((p) => p.price);
const rentsEur = rows.filter((p) => p.currency === 'EUR').map((p) => p.price);
if (rents.length) console.log(`RON: min ${Math.min(...rents)} max ${Math.max(...rents)}`);
if (rentsEur.length) console.log(`EUR: min ${Math.min(...rentsEur)} max ${Math.max(...rentsEur)}`);

await prisma.$disconnect();
