import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rows = await prisma.property.groupBy({
  by: ['zone', 'status'],
  _count: { _all: true },
  orderBy: { zone: 'asc' },
});

for (const r of rows) {
  console.log(`${String(r.zone).padEnd(24)} ${r.status.padEnd(10)} ${r._count._all}`);
}

await prisma.$disconnect();
