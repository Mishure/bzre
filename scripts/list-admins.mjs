import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const admins = await prisma.admin.findMany({
  select: { id: true, email: true, username: true, role: true, active: true },
  orderBy: { id: 'asc' },
});

console.table(admins);

await prisma.$disconnect();
