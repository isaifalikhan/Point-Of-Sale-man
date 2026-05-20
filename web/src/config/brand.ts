export const BRAND = {
  name: "Baba Jani",
  tagline: "Fast food & family dining — fresh, generous, and on time.",
  shortDescription:
    "Family restaurant in Oghi: pizza, broast, shawarma, Chinese, chaat, and delivery. Dine in, takeaway, and home delivery daily 8am–11pm.",
  longDescription:
    "Baba Jani Fast Food & Family Restaurant serves the neighborhood with a full menu from flame‑kissed pizzas and broast to paratha rolls, biryani, Chinese favorites, and sweets. Free Wi‑Fi, dine‑in comfort, and rider delivery when you want it at home.",
  stats: {
    restaurants: "Family hall",
    transactions: "Dine-in & takeaway",
    countries: "Oghi",
    uptime: "8am – 11pm",
  },
  testimonials: [
    {
      name: "Ahmed R.",
      role: "Local guest",
      quote: "Consistent taste on kabab pizzas and the family deal is perfect for weekends.",
      avatar: "AR",
    },
    {
      name: "Sana K.",
      role: "Takeaway regular",
      quote: "Shawarma platters are packed well and still hot when they arrive.",
      avatar: "SK",
    },
    {
      name: "Hassan M.",
      role: "Delivery customer",
      quote: "Easy to order on WhatsApp — rider is quick on Haider Road.",
      avatar: "HM",
    },
  ],
  features: {
    pos: {
      title: "Lightning-Fast POS",
      description: "Touch-optimized interface that handles dine-in, takeaway, and delivery with zero friction. Split bills, apply discounts, and process payments in seconds.",
      highlights: ["One-tap order entry", "Flexible payment splitting", "Offline mode resilience", "Custom modifiers & combos"],
    },
    kds: {
      title: "Kitchen Display System",
      description: "Real-time order routing to the right station. Color-coded priority, prep timers, and bump-to-done workflow that eliminates lost tickets.",
      highlights: ["Multi-station routing", "Prep time tracking", "Rush hour alerts", "Allergy flagging"],
    },
    inventory: {
      title: "Smart Inventory",
      description: "Track ingredients down to the gram. Auto-deduct from sales, get low-stock alerts, and see food cost in real-time.",
      highlights: ["Recipe costing", "Waste tracking", "Supplier management", "Auto-reorder alerts"],
    },
    analytics: {
      title: "Actionable Analytics",
      description: "Know your peak hours, best sellers, and profit margins without spreadsheet gymnastics. Data that drives decisions.",
      highlights: ["Sales heatmaps", "Staff performance", "Menu engineering", "Trend forecasting"],
    },
    staff: {
      title: "Team Management",
      description: "Role-based access, PIN login, and shift scheduling. See who sold what, when, and track performance metrics.",
      highlights: ["Role permissions", "Time tracking", "Commission reports", "Shift scheduling"],
    },
    tables: {
      title: "Floor Management",
      description: "Drag-and-drop table layouts that match your actual floor. Track status, merge tables, and manage reservations.",
      highlights: ["Visual table map", "Status indicators", "Table merging", "Wait time tracking"],
    },
  },
} as const;
