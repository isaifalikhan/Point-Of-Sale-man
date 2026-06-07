import { PrismaClient } from '@prisma/client';
import { PIZZA_TOPPING_ADDONS } from './menu-constants';
import { imageForCategory } from './menu-images';

const prisma = new PrismaClient();

type VariantMap = Record<string, number>;
type Product =
  | { name: string; price: number; description?: string }
  | { name: string; variants: VariantMap; description?: string };

type AddonSeed = { name: string; price: number };

type CategorySeed = {
  name: string;
  products: Product[];
  /** Applied to every item in the category (e.g. pizza extra toppings). */
  addons?: AddonSeed[];
};

const MENU: CategorySeed[] = [
  {
    name: 'Pizza',
    addons: [...PIZZA_TOPPING_ADDONS],
    products: [
      { name: 'Chicken Tikka Pizza', variants: { S: 499, M: 949, L: 1249, XL: 1599 } },
      { name: 'Chicken Fajita Pizza', variants: { S: 499, M: 949, L: 1249, XL: 1599 } },
      { name: 'Chicken Supreme', variants: { S: 499, M: 949, L: 1249, XL: 1599 } },
      { name: 'BBQ Cheese Pizza', variants: { S: 549, M: 1049, L: 1349, XL: 1699 } },
      { name: 'Afghani Pizza', variants: { S: 599, M: 1099, L: 1449, XL: 1799 } },
      { name: 'Cheese Lover', variants: { S: 549, M: 999, L: 1299, XL: 1599 } },
      { name: 'Creamy Pizza', variants: { S: 599, M: 1099, L: 1399, XL: 1799 } },
      { name: 'Malai Pizza', variants: { S: 650, M: 1199, L: 1499, XL: 1799 } },
      { name: 'Hot and Spicy Pizza', variants: { S: 549, M: 999, L: 1299, XL: 1599 } },
    ],
  },
  {
    name: 'Pizza Special',
    addons: [...PIZZA_TOPPING_ADDONS],
    products: [
      { name: 'Crown Crust', variants: { M: 1199, L: 1499 } },
      { name: 'Kabab Stuffar Pizza', variants: { M: 1299, L: 1599, XL: 1999 } },
      { name: 'Kabab Bite Pizza', variants: { M: 1299, L: 1599, XL: 1999 } },
      { name: 'Baba Jani Special Pizza', variants: { S: 649, M: 1249, L: 1599, XL: 1999 } },
    ],
  },
  {
    name: 'Deals',
    products: [
      { name: 'Family Deal', price: 2649 },
      { name: 'Special Deal', price: 4099 },
      { name: 'Smart Deal', price: 1799 },
      { name: 'Deal #1 - 3 Chicken Shawarma + 300ml Drink', price: 649 },
      { name: 'Deal #2 - 1 Zinger Burger + Regular Drink', price: 420 },
      { name: 'Deal #3 - 1 Zinger Burger + 1 Piece Broast + 300ml Drink', price: 700 },
      { name: 'Deal #4 - 5 Zinger Burger + 1 Liter Drink', price: 1850 },
      { name: 'Deal #5 - 3 Chicken Shawarma + Small Fries + 1 Liter Drink', price: 920 },
      { name: 'Deal #6 - 2 Medium Pizza + 1.5 Liter Drink', price: 1899 },
      { name: 'Deal #7 - 2 Large Pizza + 1.5 Liter Drink', price: 2499 },
      { name: 'Deal #8 - 5 Chicken Shawarma + 1 Liter Drink', price: 1099 },
      { name: 'Deal #9 - 2 Zinger Burger + 2 Piece Broast + 1 Liter Drink', price: 1349 },
      { name: 'Deal #10 - 5 Zinger Shawarma + 1 Liter Drink', price: 1449 },
      { name: 'Deal #11 - 10 Chicken Shawarma + 1.5 Liter Drink', price: 1899 },
      { name: 'Deal #12 - Large Pizza + Chicken Shawarma + Zinger Burger + 1.5 Liter Drink', price: 1899 },
      { name: 'Deal #13 - Pizza Fries + Small Chicken Fries + Small Garlic Fries + 1 Liter Drink', price: 899 },
      { name: 'Deal #14 - 5 Arabic Shawarma + 1.5 Liter Drink', price: 1349 },
      { name: 'Deal #15 - Large Pizza + Medium Pizza + 1.5 Liter Drink', price: 2199 },
      { name: 'Deal #16 - Large Crown Crust + Medium Crown Crust + 1 Tikka Pizza + 1.5 Liter Drink', price: 3399 },
      { name: 'Deal #17 - 5 Chicken Paratha Roll + 1 Liter Drink', price: 1249 },
      { name: 'Deal #18 - 1 Large Pizza + 5 Broast + 1.5 Liter Drink', price: 2649 },
    ],
  },
  {
    name: 'Burger',
    products: [
      { name: 'Zinger Burger', price: 350 },
      { name: 'Zinger Cheese Burger', price: 400 },
      { name: 'Chicken Burger', price: 260 },
      { name: 'Chicken Cheese Burger', price: 300 },
      { name: 'Double Dacker Burger', price: 650 },
      { name: 'Anda Shami Burger', price: 170 },
      { name: 'Shami Burger', price: 130 },
    ],
  },
  {
    name: 'Shawarma',
    products: [
      { name: 'Chicken Shawarma', price: 200 },
      { name: 'Shawarma Without Salad', price: 220 },
      { name: 'Chicken Cheese Shawarma', price: 250 },
      { name: 'Special Arabic Shawarma', price: 250 },
      { name: 'Zinger Shawarma', price: 260 },
      { name: 'Zinger Cheese Shawarma', price: 320 },
      { name: 'Chicken Platter Shawarma', price: 400 },
      { name: 'Chicken Cheese Platter', price: 450 },
      { name: 'Seek Kabab', price: 170 },
    ],
  },
  {
    name: 'Paratha Roll',
    products: [
      { name: 'Chicken Paratha Roll', price: 230 },
      { name: 'Chicken Cheese Paratha Roll', price: 280 },
      { name: 'Zinger Paratha Roll', price: 320 },
      { name: 'Zinger Cheese Roll', price: 370 },
    ],
  },
  {
    name: 'Broast',
    products: [
      { name: '1 Piece Broast', price: 300 },
      { name: '2 Piece Broast', price: 550 },
      { name: '5 Piece Broast', price: 1350 },
      { name: '12 Piece Broast', price: 3000 },
    ],
  },
  {
    name: 'Special Biryani',
    products: [
      { name: 'Chicken Biryani (Half)', price: 200 },
      { name: 'Chicken Biryani (Full)', price: 250 },
      { name: 'Simple Biryani (Half)', price: 150 },
      { name: 'Simple Biryani (Full)', price: 200 },
      { name: 'Special Biryani', price: 350 },
      { name: 'Raita + Salad (Small)', price: 50 },
      { name: 'Raita + Salad (Large)', price: 100 },
    ],
  },
  {
    name: 'Chinese',
    products: [
      { name: 'Chicken Chow Mein', price: 450 },
      { name: 'Chicken Manchurian', price: 500 },
      { name: 'Chicken Fried Rice', price: 450 },
      { name: 'Chicken Chilli with Rice', price: 550 },
      { name: 'Microni', price: 500 },
    ],
  },
  {
    name: 'Wings',
    products: [
      { name: '6 Piece Wings', price: 400 },
      { name: '12 Piece Wings', price: 750 },
    ],
  },
  {
    name: 'Nuggets',
    products: [
      { name: '6 Piece Nuggets', price: 300 },
      { name: '12 Piece Nuggets', price: 550 },
      { name: '20 Piece Nuggets', price: 900 },
    ],
  },
  {
    name: 'Sandwich',
    products: [
      { name: 'Chicken Sandwich', price: 300 },
      { name: 'Club Sandwich', price: 350 },
    ],
  },
  {
    name: 'Pasta',
    products: [
      { name: 'Creami Pasta', price: 600 },
      { name: 'Arbita Pasta', price: 700 },
      { name: 'Alfredo Pasta', price: 600 },
    ],
  },
  {
    name: 'Sweets',
    products: [
      { name: 'Sweet Fruit Chaat', price: 200 },
      { name: 'Russian Salad', price: 250 },
    ],
  },
  {
    name: 'Special Chaat',
    products: [
      { name: 'Chat Regular', price: 150 },
      { name: 'Special Chat', price: 200 },
    ],
  },
  {
    name: 'Samosa + Pakora',
    products: [
      { name: 'Samosa with Sauce', price: 30 },
      { name: 'Special Samosa + White Sauce', price: 40 },
      { name: 'Chicken Roll', price: 70 },
      { name: 'Roll', price: 30 },
      { name: 'Mix Pakora Plate', price: 150 },
    ],
  },
  {
    name: 'Goal Gappay',
    products: [
      { name: '12 Piece Goal Gappay', price: 230 },
      { name: '8 Piece Goal Gappay', price: 149 },
    ],
  },
  {
    name: 'Fries',
    products: [
      { name: 'French Fries (Regular)', price: 200 },
      { name: 'French Fries (Standard)', price: 300 },
      { name: 'Garlic Fries (Regular)', price: 250 },
      { name: 'Garlic Fries (Standard)', price: 350 },
      { name: 'Chicken Fries (Regular)', price: 300 },
      { name: 'Chicken Fries (Standard)', price: 400 },
      { name: 'Pizza Fries', price: 500 },
    ],
  },
  {
    name: 'Soup',
    products: [
      { name: 'Chicken Corn Soup', price: 150 },
      { name: 'Hot & Sour Soup', price: 180 },
      { name: 'Special Soup', price: 249 },
    ],
  },
  {
    name: 'Milk Shake',
    products: [
      { name: 'Mango Shake (Half)', price: 150 },
      { name: 'Mango Shake (Full)', price: 200 },
      { name: 'Banana Shake (Half)', price: 150 },
      { name: 'Banana Shake (Full)', price: 200 },
      { name: 'Apple Shake (Half)', price: 150 },
      { name: 'Apple Shake (Full)', price: 200 },
      { name: 'Apple Banana Shake (Half)', price: 150 },
      { name: 'Apple Banana Shake (Full)', price: 200 },
      { name: 'Date Shake (Half)', price: 200 },
      { name: 'Date Shake (Full)', price: 250 },
    ],
  },
  {
    name: 'Ice Cream',
    products: [
      { name: 'Ice Cream', price: 100 },
      { name: 'Pista Cream', price: 130 },
      { name: 'Vanilla Cream', price: 140 },
      { name: 'Special Faloda', price: 200 },
      { name: 'King Kulfa', variants: { '2 Scoops': 140, '3 Scoops': 200 } },
      { name: 'Pistachio', variants: { '2 Scoops': 140, '3 Scoops': 200 } },
      { name: 'Mango', variants: { '2 Scoops': 120, '3 Scoops': 180 } },
      { name: 'Strawberry', variants: { '2 Scoops': 120, '3 Scoops': 180 } },
      { name: 'Chocolate', variants: { '2 Scoops': 120, '3 Scoops': 180 } },
      { name: 'Vanilla', variants: { '2 Scoops': 140, '3 Scoops': 200 } },
      { name: 'Criminal Crunch', variants: { '2 Scoops': 120, '3 Scoops': 180 } },
    ],
  },
  {
    name: 'Beverages',
    products: [
      { name: 'Water Mineral', variants: { '500 ml': 60, '1 Liter': 120 } },
      { name: 'Soft Drink', variants: { '300 ml': 80, '1 Liter': 180, '1.5 Liter': 220, Jumbo: 270 } },
      { name: 'Sting', variants: { '300 ml': 100, '500 ml': 150 } },
      { name: 'Glass', price: 5 },
    ],
  },
  {
    name: 'Quetta Tea / Coffee',
    products: [
      { name: 'Quetta Special Tea', price: 80 },
      { name: 'Gurh Wali Tea', price: 90 },
      { name: 'Green Tea', price: 50 },
      { name: 'Coffee', price: 200 },
    ],
  },
];

async function main() {
  console.log('Applying flyer menu...');

  const tenant = await prisma.tenant.findFirst({
    where: { name: 'Baba Jani Fast Food' },
    include: { branches: true },
  });

  if (!tenant || tenant.branches.length === 0) {
    throw new Error('Tenant/branch not found. Run base tenant seed first.');
  }

  const tenantId = tenant.id;
  const branchId = tenant.branches[0].id;

  // Clear order/payment history tied to old menu items before replacing menu.
  const orders = await prisma.order.findMany({ where: { branchId } });
  const orderIds = orders.map((o) => o.id);
  if (orderIds.length > 0) {
    await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
  }

  await prisma.menuItem.deleteMany({ where: { tenantId } });
  await prisma.menuCategory.deleteMany({ where: { tenantId } });

  for (const cat of MENU) {
    const category = await prisma.menuCategory.create({
      data: { name: cat.name, tenantId },
    });

    for (const p of cat.products) {
      const hasVariants = 'variants' in p;
      await prisma.menuItem.create({
        data: {
          name: p.name,
          description: p.description ?? null,
          price: hasVariants ? 0 : p.price,
          image: imageForCategory(cat.name),
          isAvailable: true,
          categoryId: category.id,
          tenantId,
          variants: hasVariants
            ? {
                set: Object.entries(p.variants).map(([name, price]) => ({
                  name,
                  price,
                })),
              }
            : undefined,
          addons: cat.addons?.length
            ? { set: cat.addons.map((a) => ({ name: a.name, price: a.price })) }
            : undefined,
        },
      });
    }
  }

  console.log(`Done. Categories: ${MENU.length}`);
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

