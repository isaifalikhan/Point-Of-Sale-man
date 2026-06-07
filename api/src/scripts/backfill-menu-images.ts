import { PrismaClient } from '@prisma/client';
import { CATEGORY_IMAGES } from './menu-images';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst({
    where: { name: 'Baba Jani Fast Food' },
  });

  if (!tenant) {
    throw new Error('Tenant "Baba Jani Fast Food" not found');
  }

  const categories = await prisma.menuCategory.findMany({
    where: { tenantId: tenant.id },
  });

  let updated = 0;
  for (const category of categories) {
    const image = CATEGORY_IMAGES[category.name];
    if (!image) continue;

    const res = await prisma.menuItem.updateMany({
      where: {
        tenantId: tenant.id,
        categoryId: category.id,
      },
      data: { image },
    });
    updated += res.count;
  }

  console.log(`Backfilled images for ${updated} menu items.`);
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
