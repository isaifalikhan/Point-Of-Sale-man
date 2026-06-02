import { PrismaClient, TableStatus } from '@prisma/client';

const prisma = new PrismaClient();

const FAMILY_CAPACITY = 6;
const GENERAL_CAPACITY = 4;
const ROOFTOP_CAPACITY = 4;

async function main() {
  console.log('Seeding tables for Baba Jani Fast Food...');

  const tenant = await prisma.tenant.findFirst({
    where: { name: 'Baba Jani Fast Food' },
    include: { branches: true },
  });

  if (!tenant || !tenant.branches || tenant.branches.length === 0) {
    console.error('Tenant or Branch not found. Have you ran the Baba Jani seed yet?');
    return;
  }

  const branchId = tenant.branches[0].id;

  console.log('Clearing old table assignments...');
  await prisma.order.updateMany({
    where: { branchId, tableId: { not: null } },
    data: { tableId: null },
  });

  await prisma.table.deleteMany({ where: { branchId } });

  console.log('Creating 31 tables (Family 1–10, General 11–21, Rooftop 1–10)...');

  const tablePromises: Promise<unknown>[] = [];

  for (let i = 1; i <= 10; i++) {
    tablePromises.push(
      prisma.table.create({
        data: {
          name: `Family Hall - Table ${i}`,
          capacity: FAMILY_CAPACITY,
          status: TableStatus.AVAILABLE,
          branchId,
          x: 0,
          y: 0,
        },
      }),
    );
  }

  for (let i = 11; i <= 21; i++) {
    tablePromises.push(
      prisma.table.create({
        data: {
          name: `General Hall - Table ${i}`,
          capacity: GENERAL_CAPACITY,
          status: TableStatus.AVAILABLE,
          branchId,
          x: 0,
          y: 0,
        },
      }),
    );
  }

  for (let i = 1; i <= 10; i++) {
    tablePromises.push(
      prisma.table.create({
        data: {
          name: `Rooftop - Table ${i}`,
          capacity: ROOFTOP_CAPACITY,
          status: TableStatus.AVAILABLE,
          branchId,
          x: 0,
          y: 0,
        },
      }),
    );
  }

  await Promise.all(tablePromises);

  console.log(
    'Done: 10 Family Hall + 11 General Hall + 10 Rooftop = 31 total.',
  );
}

main()
  .catch((e) => {
    console.error('Error seeding tables:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
