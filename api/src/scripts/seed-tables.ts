import { PrismaClient, TableStatus } from '@prisma/client';

const prisma = new PrismaClient();

/** Rooftop: 4 seats each. Ground: mixed capacities to show 1–4 chair layouts */
const GROUND_CAPACITIES = [2, 4, 4, 6] as const;

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

  console.log('Creating 22 tables (Rooftop 1–18, Ground 1–4)...');

  const tablePromises: Promise<unknown>[] = [];

  for (let i = 1; i <= 18; i++) {
    tablePromises.push(
      prisma.table.create({
        data: {
          name: `Rooftop - Table ${i}`,
          capacity: 4,
          status: TableStatus.AVAILABLE,
          branchId,
          x: 0,
          y: 0,
        },
      }),
    );
  }

  for (let i = 1; i <= 4; i++) {
    tablePromises.push(
      prisma.table.create({
        data: {
          name: `Ground Floor - Table ${i}`,
          capacity: GROUND_CAPACITIES[i - 1] ?? 4,
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
    'Done: 18 Rooftop (4 seats) + 4 Ground Floor (2/4/4/6 seats) = 22 total.',
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
