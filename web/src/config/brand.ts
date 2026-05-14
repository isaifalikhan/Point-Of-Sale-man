export const BRAND = {
  name: "RestoOS",
  tagline: "Restaurant intelligence, beautifully simple.",
  shortDescription:
    "Point of sale, kitchen, inventory, and analytics in one luminous workspace.",
  longDescription:
    "RestoOS is the all-in-one restaurant management platform that brings together point of sale, kitchen display, inventory tracking, staff management, and real-time analytics. Built for speed, designed for clarity.",
  stats: {
    restaurants: "2,500+",
    transactions: "10M+",
    countries: "25+",
    uptime: "99.9%",
  },
  testimonials: [
    {
      name: "Maria Santos",
      role: "Owner, La Cocina Fresca",
      quote: "RestoOS cut our order errors by 80%. The kitchen display alone paid for itself in the first month.",
      avatar: "MS",
    },
    {
      name: "James Chen",
      role: "GM, Harbor Bistro",
      quote: "Finally, a POS that doesn't feel like it was built in 2005. Our staff learned it in under an hour.",
      avatar: "JC",
    },
    {
      name: "Sarah Mitchell",
      role: "Operations Director, Grill House Chain",
      quote: "Managing 12 locations used to be chaos. Now I see everything in one dashboard. Game changer.",
      avatar: "SM",
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
