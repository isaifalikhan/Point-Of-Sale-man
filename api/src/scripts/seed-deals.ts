import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEALS = [
  { name: 'Deal 1 - 3 Chicken Shawarma + 300ml drink', price: 649 },
  { name: 'Deal 2 - 1 Zinger Burger + regular drink', price: 420 },
  { name: 'Deal 3 - 1 Zinger Burger + 1 pc broast + 300ml drink', price: 700 },
  { name: 'Deal 4 - 5 Zinger Burgers + 1 L drink', price: 1850 },
  { name: 'Deal 5 - 3 Chicken Shawarma + small fries + 1 L drink', price: 920 },
  { name: 'Deal 6 - 2 medium pizzas + 1.5 L drink', price: 1899 },
  { name: 'Deal 7 - 2 large pizzas + 1.5 L drink', price: 2499 },
  { name: 'Deal 8 - 5 Chicken Shawarma + 1 L drink', price: 1099 },
  { name: 'Deal 9 - 2 Zinger Burgers + 2 pc broast + 1 L drink', price: 1349 },
  { name: 'Deal 10 - 5 Zinger Shawarma + 1 L drink', price: 1449 },
  { name: 'Deal 11 - 10 Chicken Shawarma + 1.5 L drink', price: 1899 },
  { name: 'Deal 12 - Large pizza + chicken shawarma + zinger burger + 1.5 L drink', price: 1899 },
  { name: 'Deal 13 - Pizza fries + small chicken fries + small garlic fries + 1 L drink', price: 899 },
  { name: 'Deal 14 - 5 Arabic Shawarma + 1.5 L drink', price: 1349 },
  { name: 'Deal 15 - Large + medium pizza + 1.5 L drink', price: 2199 },
  { name: 'Deal 16 - Large kabab stuffer + medium crown crust + small tikka + 1.5 L drink', price: 3399 },
  { name: 'Deal 17 - 5 Chicken Paratha Rolls + 1 L drink', price: 1249 },
  { name: 'Deal 18 - 1 large pizza + 5 broast + 1.5 L drink', price: 2649 },
  { name: 'Family Deal - Large + medium + small pizza + 1.5 L drink', price: 2649 },
  { name: 'Special Deal - XL + large + medium + small pizzas + 1.5 L drink', price: 4099 },
  { name: 'Smart Deal - Large + small pizza + 1.5 L drink', price: 1799 },
] as const;

async function main() {
  const tenant = await prisma.tenant.findFirst({
    where: { name: 'Baba Jani Fast Food' },
  });

  if (!tenant) {
    throw new Error('Tenant "Baba Jani Fast Food" not found');
  }

  const tenantId = tenant.id;

  let dealsCategory = await prisma.menuCategory.findFirst({
    where: { tenantId, name: 'Deals' },
  });

  if (!dealsCategory) {
    dealsCategory = await prisma.menuCategory.create({
      data: {
        name: 'Deals',
        tenantId,
      },
    });
  }

  for (const deal of DEALS) {
    const existing = await prisma.menuItem.findFirst({
      where: { tenantId, categoryId: dealsCategory.id, name: deal.name },
    });

    if (existing) {
      await prisma.menuItem.update({
        where: { id: existing.id },
        data: {
          price: deal.price,
          isAvailable: true,
        },
      });
      continue;
    }

    await prisma.menuItem.create({
      data: {
        name: deal.name,
        description: 'Ready-made combo deal',
        price: deal.price,
        isAvailable: true,
        categoryId: dealsCategory.id,
        tenantId,
      },
    });
  }

  console.log(`Deals ready: ${DEALS.length} items in "Deals" category.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
