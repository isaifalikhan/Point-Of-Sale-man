/**
 * Must match `Permission` keys returned by the API / embeded in JWT.
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

export function readPermissionsFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('userPermissions');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === 'string');
  } catch {
    return [];
  }
}

/** True if the user holds ALL or any listed permission. */
export function hasAnyPermission(userPermissions: string[], required: string[]): boolean {
  if (!required.length) return true;
  const u = userPermissions;
  if (u.includes(Permission.ALL)) return true;
  return required.some((key) => u.includes(key));
}
