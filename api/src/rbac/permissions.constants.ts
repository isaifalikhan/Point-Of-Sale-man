/**
 * Permission keys stored per Role and embedded in JWT. `ALL` grants every action.
 */
export const Permission = {
  ALL: 'ALL',
  POS_ACCESS: 'POS_ACCESS',
  ORDERS_VIEW: 'ORDERS_VIEW',
  MENU_MANAGE: 'MENU_MANAGE',
  TABLES_MANAGE: 'TABLES_MANAGE',
  INVENTORY_MANAGE: 'INVENTORY_MANAGE',
  ANALYTICS_VIEW: 'ANALYTICS_VIEW',
  STAFF_MANAGE: 'STAFF_MANAGE',
  KITCHEN_OPS: 'KITCHEN_OPS',
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

export type PermissionCatalogEntry = {
  key: PermissionKey;
  label: string;
  description: string;
};

export const PERMISSION_CATALOG: PermissionCatalogEntry[] = [
  {
    key: Permission.ALL,
    label: 'Full access',
    description: 'All features (typically reserved for the business owner preset).',
  },
  {
    key: Permission.POS_ACCESS,
    label: 'Point of Sale',
    description: 'Open the POS, create orders, use tables and catalog where needed.',
  },
  {
    key: Permission.ORDERS_VIEW,
    label: 'Orders & history',
    description: 'Read order lists and ticket details.',
  },
  {
    key: Permission.MENU_MANAGE,
    label: 'Menu / catalog',
    description: 'Create and edit categories and items.',
  },
  {
    key: Permission.TABLES_MANAGE,
    label: 'Tables & layout',
    description: 'Create, move, or remove tables.',
  },
  {
    key: Permission.INVENTORY_MANAGE,
    label: 'Inventory',
    description: 'Ingredients, stock, and recipe linking.',
  },
  {
    key: Permission.ANALYTICS_VIEW,
    label: 'Analytics',
    description: 'Revenue summaries and dashboards.',
  },
  {
    key: Permission.STAFF_MANAGE,
    label: 'Roles & employees',
    description: 'Add staff, assign roles, and customize permission presets.',
  },
  {
    key: Permission.KITCHEN_OPS,
    label: 'Kitchen / KDS',
    description: 'Update order or item status from the kitchen view.',
  },
];
