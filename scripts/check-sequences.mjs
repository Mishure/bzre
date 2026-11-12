/**
 * Compares each table's autoincrement sequence with its actual MAX(id).
 *
 * A sequence at or below MAX(id) makes the next INSERT fail with
 * "Unique constraint failed on the fields: (id)" — which is what broke the
 * Storia importer's image inserts. Happens when rows were inserted with
 * explicit ids (a data migration or seed) without advancing the sequence.
 *
 * Read-only unless --fix is passed.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const fix = process.argv.includes('--fix');

const tables = await prisma.$queryRaw`
  SELECT c.table_name, c.column_name, c.column_default
  FROM information_schema.columns c
  JOIN information_schema.tables t
    ON t.table_name = c.table_name AND t.table_schema = c.table_schema
  WHERE c.table_schema = 'public'
    AND c.column_name = 'id'
    AND t.table_type = 'BASE TABLE'
  ORDER BY c.table_name
`;

console.log(`=== ${tables.length} tabele cu coloana id ===\n`);

const broken = [];

for (const row of tables) {
  const t = row.table_name;
  const seqMatch = (row.column_default ?? '').match(/nextval\('([^']+)'/);
  if (!seqMatch) {
    console.log(`${t.padEnd(22)} default=${row.column_default ?? 'NULL'}  (nu e serial)`);
    continue;
  }
  const seq = seqMatch[1];

  const maxRows = await prisma.$queryRawUnsafe(
    `SELECT COALESCE(MAX(id), 0)::int AS max_id FROM "${t}"`
  );
  const maxId = Number(maxRows[0].max_id);

  const seqRows = await prisma.$queryRawUnsafe(
    `SELECT last_value::int AS last_value, is_called FROM "${seq}"`
  );
  const lastValue = Number(seqRows[0].last_value);
  const nextId = seqRows[0].is_called ? lastValue + 1 : lastValue;
  const ok = nextId > maxId;

  console.log(
    `${t.padEnd(22)} max_id=${String(maxId).padStart(5)}  urmatorul=${String(nextId).padStart(5)}  ${ok ? 'OK' : '*** RUPT ***'}`
  );
  if (!ok) broken.push({ table: t, seq, maxId });
}

if (broken.length === 0) {
  console.log('\nToate secventele sunt corecte.');
} else if (!fix) {
  console.log(`\n${broken.length} secvente rupte. Ruleaza cu --fix pentru a le corecta.`);
} else {
  console.log('\n=== CORECTEZ ===');
  for (const b of broken) {
    await prisma.$queryRawUnsafe(`SELECT setval('${b.seq}', ${b.maxId} + 1, false)`);
    console.log(`  ${b.table}: urmatorul id va fi ${b.maxId + 1}`);
  }
}

await prisma.$disconnect();
