import { PrismaClient } from '@prisma/client';
import { PIZZA_TOPPING_ADDONS } from './menu-constants';

const prisma = new PrismaClient();

const PIZZA_CATEGORIES = ['Pizza', 'Pizza Special'];

async function main() {
  const tenant = await prisma.tenant.findFirst({
    where: { name: 'Baba Jani Fast Food' },
  });

  if (!tenant) {
    throw new Error('Tenant "Baba Jani Fast Food" not found');
  }

  const categories = await prisma.menuCategory.findMany({
    where: { tenantId: tenant.id, name: { in: PIZZA_CATEGORIES } },
    include: { items: true },
  });

  let updated = 0;
  for (const cat of categories) {
    for (const item of cat.items) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: {
          addons: {
            set: PIZZA_TOPPING_ADDONS.map((a) => ({ name: a.name, price: a.price })),
          },
        },
      });
      updated++;
    }
  }

  console.log(`Updated ${updated} pizza items with extra topping addons.`);
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
