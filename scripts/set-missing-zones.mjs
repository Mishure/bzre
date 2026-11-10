import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Zones derived from each listing's `street` value, which carried the
// neighbourhood because the import never populated `zone`:
//   #31 "zona Crang judetul Buzau"   -> Crang
//   #32 "Unirii Sud judetul Buzau"   -> Unirii Sud
//   #34 "zona Crang judetul Buzau"   -> Crang
const UPDATES = [
  { id: 31, zone: 'Crang' },
  { id: 32, zone: 'Unirii Sud' },
  { id: 34, zone: 'Crang' },
];

const apply = process.argv.includes('--apply');

console.log(apply ? '=== APLIC modificarile ===\n' : '=== DRY RUN (fara --apply nu scrie nimic) ===\n');

for (const u of UPDATES) {
  const before = await prisma.property.findUnique({
    where: { id: u.id },
    select: { id: true, name: true, zone: true, street: true, status: true },
  });

  if (!before) {
    console.log(`#${u.id}  LIPSESTE din baza de date — sarit\n`);
    continue;
  }

  // Guard: only fill in a zone that is actually empty, never overwrite one
  // the agency has set in the meantime.
  const isEmpty = !before.zone || before.zone.trim() === '';
  if (!isEmpty) {
    console.log(`#${u.id}  are deja zone=${JSON.stringify(before.zone)} — sarit (nu suprascriu)\n`);
    continue;
  }

  console.log(`#${u.id}  ${before.name}`);
  console.log(`     street = ${JSON.stringify(before.street)}`);
  console.log(`     zone   ${JSON.stringify(before.zone)}  ->  ${JSON.stringify(u.zone)}`);

  if (apply) {
    const after = await prisma.property.update({
      where: { id: u.id },
      data: { zone: u.zone },
      select: { id: true, zone: true },
    });
    console.log(`     scris: zone=${JSON.stringify(after.zone)}`);
  }
  console.log('');
}

const remaining = await prisma.property.count({
  where: { status: 'ACTIVE', OR: [{ zone: null }, { zone: '' }] },
});
console.log(`Proprietati ACTIVE fara zona (dupa): ${remaining}`);

await prisma.$disconnect();
