/**
 * Rewrite property names to SEO-friendly format.
 *
 * Usage:
 *   npx tsx scripts/rewrite-property-names.ts             # preview only (no writes)
 *   npx tsx scripts/rewrite-property-names.ts --apply     # actually update DB
 *   npx tsx scripts/rewrite-property-names.ts --apply --id=5,10,12   # only specific IDs
 */
import { PrismaClient } from "@prisma/client";
import { generateSeoName } from "../src/lib/seoName";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const idArg = args.find((a) => a.startsWith("--id="));
  const onlyIds = idArg
    ? idArg
        .slice("--id=".length)
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !Number.isNaN(n))
    : null;

  const properties = await prisma.property.findMany({
    where: onlyIds ? { id: { in: onlyIds } } : undefined,
    select: {
      id: true,
      name: true,
      propertyType: true,
      operationType: true,
      rooms: true,
      zone: true,
      locality: true,
      surface: true,
    },
    orderBy: { id: "asc" },
  });

  console.log(
    `${apply ? "[APPLY]" : "[PREVIEW]"} processing ${properties.length} properties\n`
  );

  let willChange = 0;
  for (const p of properties) {
    const proposed = generateSeoName({
      propertyType: p.propertyType,
      operationType: p.operationType,
      rooms: p.rooms,
      zone: p.zone,
      locality: p.locality,
      surface: p.surface,
    });

    const same = p.name === proposed;
    if (!same) willChange++;

    console.log(`#${p.id}`);
    console.log(`  was: ${p.name}`);
    console.log(`  new: ${proposed}${same ? "  (unchanged)" : ""}`);

    if (apply && !same) {
      await prisma.property.update({
        where: { id: p.id },
        data: { name: proposed },
      });
      console.log("  → updated");
    }
    console.log();
  }

  console.log(
    `${apply ? "[APPLIED]" : "[PREVIEW]"} ${willChange} of ${properties.length} would change.`
  );
  if (!apply) {
    console.log("Run with --apply to actually update the database.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
