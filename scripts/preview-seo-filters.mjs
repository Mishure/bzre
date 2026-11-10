import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalize(s) {
  if (!s) return '';
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

const all = await prisma.property.findMany({
  where: { status: 'ACTIVE' },
  select: {
    id: true, name: true, zone: true, rooms: true, surface: true,
    price: true, currency: true, propertyType: true, operationType: true,
  },
  orderBy: { id: 'asc' },
});

const cases = [
  {
    label: 'garsoniere de inchiriat (APARTAMENT + INCHIRIERE + rooms=1)',
    fn: (p) => p.propertyType === 'APARTAMENT' && p.operationType === 'INCHIRIERE' && p.rooms === 1,
  },
  {
    label: 'zona Crang (APARTAMENT, orice operatiune, zone~crang)',
    fn: (p) => p.propertyType === 'APARTAMENT' && normalize(p.zone).includes('crang'),
  },
  {
    label: 'zona Crang (orice tip, orice operatiune)',
    fn: (p) => normalize(p.zone).includes('crang'),
  },
];

for (const c of cases) {
  const hits = all.filter(c.fn);
  console.log(`\n${c.label} -> ${hits.length}`);
  for (const p of hits) {
    console.log(`   #${p.id}  ${p.propertyType}/${p.operationType}  ${p.rooms ?? '-'} cam  ${p.surface} mp  ${p.price} ${p.currency ?? ''}  zone="${p.zone}"`);
  }
}

await prisma.$disconnect();
