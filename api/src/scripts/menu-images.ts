/** Category hero images used for menu items until per-item photos are uploaded. */
export const CATEGORY_IMAGES: Record<string, string> = {
  Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'Pizza Special': 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&q=80',
  Deals: 'https://images.unsplash.com/photo-1628177074662-114cfb5f09b5?w=800&q=80',
  Burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  Shawarma: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
  'Paratha Roll': 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&q=80',
  Broast: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
  'Special Biryani': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80',
  Chinese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
  Wings: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80',
  Nuggets: 'https://images.unsplash.com/photo-1606755962773-0d330d7d0fe3?w=800&q=80',
  Sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
  Pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  Sweets: 'https://images.unsplash.com/photo-1605197161470-5f1f0ee6f11f?w=800&q=80',
  'Special Chaat': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
  'Samosa + Pakora': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
  'Goal Gappay': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  Fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
  Soup: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
  'Milk Shake': 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&q=80',
  'Ice Cream': 'https://images.unsplash.com/photo-1497034825429-c343d706a68f?w=800&q=80',
  Beverages: 'https://images.unsplash.com/photo-1622483767028-3f66f32a9c47?w=800&q=80',
  'Quetta Tea / Coffee': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80',
};

export const DEFAULT_MENU_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

export function imageForCategory(categoryName: string | undefined): string {
  if (!categoryName) return DEFAULT_MENU_IMAGE;
  return CATEGORY_IMAGES[categoryName] ?? DEFAULT_MENU_IMAGE;
}
