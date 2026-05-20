/**
 * Menu catalog from Baba Jani printed menus (pricing as provided).
 * Used by the public /menu page only.
 */

export type PriceCell = string | null;

export type PizzaRow = {
  name: string;
  s?: PriceCell;
  m?: PriceCell;
  l?: PriceCell;
  ext?: PriceCell;
  note?: string;
};

export const PIZZA_STANDARD: PizzaRow[] = [
  { name: "Chicken Tikka Pizza", s: "499", m: "949", l: "1249", ext: "1599" },
  { name: "Chicken Fajita Pizza", s: "499", m: "949", l: "1249", ext: "1599" },
  { name: "Chicken Supreme", s: "499", m: "949", l: "1249", ext: "1599" },
  { name: "BBQ Cheese Pizza", s: "549", m: "1049", l: "1349", ext: "1699" },
  { name: "Afghani Pizza", s: "599", m: "1099", l: "1449", ext: "1799" },
  { name: "Cheese Lover", s: "549", m: "999", l: "1299", ext: "1599" },
  { name: "Creamy Pizza", s: "599", m: "1099", l: "1399", ext: "1799" },
  { name: "Malai Boti Pizza", s: "650", m: "1199", l: "1499", ext: "1799" },
  { name: "Hot and Spicy Pizza", s: "549", m: "999", l: "1299", ext: "1599" },
];

export const PIZZA_SPECIAL: PizzaRow[] = [
  { name: "Crown Crust", s: null, m: "1199", l: "1499", ext: "1799" },
  { name: "Kabab Stuffar Pizza", s: null, m: "1299", l: "1599", ext: "1999" },
  { name: "Kabab Bite Pizza", s: null, m: "1299", l: "1599", ext: "1999" },
  { name: "Baba Jani Special Pizza", s: "649", m: "1249", l: "1599", ext: "1999" },
];

export const PIZZA_EXTRAS = {
  toppings: "Extra toppings — Reg: Rs 49 · Med: Rs 99 · Large: Rs 149 · Ext L: Rs 199",
  crusts: "Crust options — Normal classic · Deep dish · Thin crust",
} as const;

export const BUNDLE_DEALS = [
  { title: "Family Deal", price: "2649", desc: "Large pizza, medium pizza, small pizza, 1.5 L drink" },
  { title: "Special Deal", price: "4099", desc: "Extra large, large, medium & small pizzas, 1.5 L drink" },
  { title: "Smart Deal", price: "1799", desc: "Large pizza, small pizza, 1.5 L drink" },
] as const;

export const NUMBERED_DEALS = [
  { n: 1, name: "3 Chicken Shawarma + 300ml drink", price: "649" },
  { n: 2, name: "1 Zinger Burger + regular drink", price: "420" },
  { n: 3, name: "1 Zinger Burger + 1 pc broast + 300ml drink", price: "700" },
  { n: 4, name: "5 Zinger Burgers + 1 L drink", price: "1850" },
  { n: 5, name: "3 Chicken Shawarma + small fries + 1 L drink", price: "920" },
  { n: 6, name: "2 medium pizzas + 1.5 L drink", price: "1899" },
  { n: 7, name: "2 large pizzas + 1.5 L drink", price: "2499" },
  { n: 8, name: "5 Chicken Shawarma + 1 L drink", price: "1099" },
  { n: 9, name: "2 Zinger Burgers + 2 pc broast + 1 L drink", price: "1349" },
  { n: 10, name: "5 Zinger Shawarma + 1 L drink", price: "1449" },
  { n: 11, name: "10 Chicken Shawarma + 1.5 L drink", price: "1899" },
  { n: 12, name: "Large pizza + chicken shawarma + zinger burger + 1.5 L drink", price: "1899" },
  { n: 13, name: "Pizza fries + small chicken fries + small garlic fries + 1 L drink", price: "899" },
  { n: 14, name: "5 Arabic Shawarma + 1.5 L drink", price: "1349" },
  { n: 15, name: "Large + medium pizza + 1.5 L drink", price: "2199" },
  {
    n: 16,
    name: "1 large special kabab stuffer + 1 medium crown crust + 1 small tikka pizza + 1.5 L drink",
    price: "3399",
  },
  { n: 17, name: "5 Chicken Paratha Rolls + 1 L drink", price: "1249" },
  { n: 18, name: "1 large pizza + 5 broast + 1.5 L drink", price: "2649" },
] as const;

export type MenuLine = { name: string; price: string; note?: string };

export type MenuSection = { title: string; items: MenuLine[] };

export const MAIN_MENU_SECTIONS: MenuSection[] = [
  {
    title: "Burger",
    items: [
      { name: "Zinger Burger", price: "350" },
      { name: "Zinger Cheese Burger", price: "400" },
      { name: "Chicken Burger", price: "260" },
      { name: "Chicken Cheese Burger", price: "300" },
      { name: "Double Decker Burger", price: "650" },
      { name: "Anda Shami Burger", price: "170" },
      { name: "Shami Burger", price: "130" },
    ],
  },
  {
    title: "Shawarma",
    items: [
      { name: "Chicken Shawarma", price: "200" },
      { name: "Shawarma without salad", price: "220" },
      { name: "Chicken Cheese Shawarma", price: "250" },
      { name: "Special Arabic Shawarma", price: "250" },
      { name: "Zinger Shawarma", price: "260" },
      { name: "Zinger Cheese Shawarma", price: "320" },
      { name: "Chicken Platter Shawarma", price: "400" },
      { name: "Chicken Cheese Platter", price: "450" },
      { name: "Seekh Kabab", price: "170" },
    ],
  },
  {
    title: "Paratha roll",
    items: [
      { name: "Chicken Paratha Roll", price: "230" },
      { name: "Chicken Cheese Paratha Roll", price: "280" },
      { name: "Zinger Paratha Roll", price: "320" },
      { name: "Zinger Cheese Paratha Roll", price: "370" },
    ],
  },
  {
    title: "Broast",
    items: [{ name: "1 / 2 / 5 / 12 piece", price: "300 / 550 / 1350 / 3000" }],
  },
  {
    title: "Quetta tea / coffee",
    items: [
      { name: "Quetta special tea", price: "80" },
      { name: "Gurh wali tea", price: "90" },
      { name: "Green tea", price: "50" },
      { name: "Coffee", price: "200" },
    ],
  },
  {
    title: "Special biryani (half / full)",
    items: [
      { name: "Chicken Biryani", price: "200 / 250" },
      { name: "Simple Biryani", price: "150 / 200" },
      { name: "Special Biryani (full)", price: "350", note: "Extra charges may apply" },
      { name: "Raita + salad", price: "50 / 100" },
    ],
  },
  {
    title: "Chinese",
    items: [
      { name: "Chicken Chow Mein", price: "450" },
      { name: "Chicken Manchurian", price: "500" },
      { name: "Chicken Fried Rice", price: "450" },
      { name: "Chicken Chilli with Rice", price: "550" },
      { name: "Macaroni", price: "500" },
    ],
  },
  {
    title: "Wings / nuggets",
    items: [
      { name: "Wings — 6 / 12 piece", price: "400 / 750" },
      { name: "Nuggets — 6 / 12 / 20 piece", price: "300 / 550 / 900" },
    ],
  },
  {
    title: "Sandwich / pasta",
    items: [
      { name: "Chicken Sandwich", price: "300" },
      { name: "Club Sandwich", price: "350" },
      { name: "Creamy Pasta", price: "600" },
      { name: "Arrabiata Pasta", price: "700" },
      { name: "Alfredo Pasta", price: "600" },
    ],
  },
  {
    title: "Sweets (single)",
    items: [
      { name: "Sweet fruit chaat", price: "200" },
      { name: "Russian salad", price: "250" },
    ],
  },
  {
    title: "Special chaat / samosa / pakora",
    items: [
      { name: "Chat regular / special chat", price: "150 / 200" },
      { name: "Samosa with sauce", price: "30" },
      { name: "Special samosa + white sauce", price: "40" },
      { name: "Chicken roll / roll", price: "70 / 30" },
      { name: "Mix pakora plate", price: "150" },
    ],
  },
  {
    title: "Gol gappay",
    items: [{ name: "12 / 8 piece", price: "230 / 149" }],
  },
  {
    title: "Fries (regular / standard)",
    items: [
      { name: "French fries", price: "200 / 300" },
      { name: "Garlic fries", price: "250 / 350" },
      { name: "Chicken fries", price: "300 / 400" },
      { name: "Pizza fries", price: "500" },
    ],
  },
  {
    title: "Soup",
    items: [
      { name: "Chicken corn soup", price: "150" },
      { name: "Hot & sour", price: "180" },
      { name: "Special soup", price: "249" },
    ],
  },
  {
    title: "Milk shake (half / full)",
    items: [
      { name: "Mango / banana / apple / apple banana", price: "150 / 200" },
      { name: "Date shake", price: "200 / 250" },
    ],
  },
  {
    title: "Ice cream",
    items: [
      { name: "Ice cream", price: "100" },
      { name: "Pista cream", price: "130" },
      { name: "Vanilla cream", price: "140" },
      { name: "Special falooda", price: "200" },
    ],
  },
];
