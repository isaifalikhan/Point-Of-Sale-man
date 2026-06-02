import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Product =
  | { name: string; price: number }
  | { name: string; variants: Record<string, number> };

const ADDITIONS: Record<string, Product[]> = {
  'Ice Cream': [
    { name: 'King Kulfa', variants: { '2 Scoops': 140, '3 Scoops': 200 } },
    { name: 'Pistachio', variants: { '2 Scoops': 140, '3 Scoops': 200 } },
    { name: 'Mango', variants: { '2 Scoops': 120, '3 Scoops': 180 } },
    { name: 'Strawberry', variants: { '2 Scoops': 120, '3 Scoops': 180 } },
    { name: 'Chocolate', variants: { '2 Scoops': 120, '3 Scoops': 180 } },
    { name: 'Vanilla', variants: { '2 Scoops': 140, '3 Scoops': 200 } },
    { name: 'Criminal Crunch', variants: { '2 Scoops': 120, '3 Scoops': 180 } },
  ],
  Beverages: [
    { name: 'Water Mineral', variants: { '500 ml': 60, '1 Liter': 120 } },
    { name: 'Soft Drink', variants: { '300 ml': 80, '1 Liter': 180, '1.5 Liter': 220, Jumbo: 270 } },
    { name: 'Sting', variants: { '300 ml': 100, '500 ml': 150 } },
    { name: 'Glass', price: 5 },
  ],
};

async function main() {
  const tenant = await prisma.tenant.findFirst({
    where: { name: 'Baba Jani Fast Food' },
  });

  if (!tenant) {
    throw new Error('Tenant "Baba Jani Fast Food" not found');
  }

  let addedOrUpdated = 0;

  for (const [categoryName, products] of Object.entries(ADDITIONS)) {
    let category = await prisma.menuCategory.findFirst({
      where: { tenantId: tenant.id, name: categoryName },
    });

    if (!category) {
      category = await prisma.menuCategory.create({
        data: { tenantId: tenant.id, name: categoryName },
      });
    }

    for (const product of products) {
      const existing = await prisma.menuItem.findFirst({
        where: {
          tenantId: tenant.id,
          categoryId: category.id,
          name: product.name,
        },
      });

      const data =
        'variants' in product
          ? {
              price: 0,
              variants: { set: Object.entries(product.variants).map(([name, price]) => ({ name, price })) },
              isAvailable: true,
            }
          : {
              price: product.price,
              variants: { set: [] as { name: string; price: number }[] },
              isAvailable: true,
            };

      if (existing) {
        await prisma.menuItem.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await prisma.menuItem.create({
          data: {
            tenantId: tenant.id,
            categoryId: category.id,
            name: product.name,
            ...data,
          },
        });
      }
      addedOrUpdated += 1;
    }
  }

  console.log(`Added/updated ${addedOrUpdated} menu items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

