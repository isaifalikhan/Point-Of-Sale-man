import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  ChefHat,
  Grid3x3,
  Home,
  LayoutDashboard,
  List,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { hasAnyPermission, Permission, type PermissionKey } from '@/lib/rbac';

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  businessTypes?: ('RESTAURANT' | 'CLOTHING')[];
  /** Show when the user has any of these (ALL always passes). */
  requiredPermissions?: PermissionKey[];
  section?: 'main' | 'cta' | 'footer';
};

export const DASHBOARD_NAV_CORE: DashboardNavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: Home,
    section: 'main',
  },
  {
    href: '/dashboard/menu',
    label: 'Menu',
    icon: List,
    requiredPermissions: [Permission.MENU_MANAGE, Permission.POS_ACCESS],
    section: 'main',
  },
];

export const DASHBOARD_NAV_RESTAURANT: DashboardNavItem[] = [
  {
    href: '/dashboard/tables',
    label: 'Tables',
    icon: Grid3x3,
    businessTypes: ['RESTAURANT'],
    requiredPermissions: [
      Permission.TABLES_MANAGE,
      Permission.POS_ACCESS,
      Permission.KITCHEN_OPS,
    ],
    section: 'main',
  },
  {
    href: '/dashboard/kds',
    label: 'Kitchen',
    icon: ChefHat,
    businessTypes: ['RESTAURANT'],
    requiredPermissions: [Permission.KITCHEN_OPS, Permission.ORDERS_VIEW],
    section: 'main',
  },
];

export const DASHBOARD_NAV_ADMIN: DashboardNavItem[] = [
  {
    href: '/dashboard/inventory',
    label: 'Inventory',
    icon: LayoutDashboard,
    requiredPermissions: [Permission.INVENTORY_MANAGE],
    section: 'main',
  },
  {
    href: '/dashboard/staff',
    label: 'Staff',
    icon: Users,
    requiredPermissions: [Permission.STAFF_MANAGE],
    section: 'main',
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3,
    requiredPermissions: [Permission.ANALYTICS_VIEW],
    section: 'main',
  },
];

export const DASHBOARD_NAV_POS_CTA = {
  href: '/dashboard/pos',
  label: 'Open POS',
  icon: ShoppingCart,
  requiredPermissions: [Permission.POS_ACCESS] as PermissionKey[],
  section: 'cta' as const,
};

export const DASHBOARD_NAV_SETTINGS: DashboardNavItem = {
  href: '/dashboard/settings',
  label: 'Settings',
  icon: Settings,
  requiredPermissions: [Permission.MENU_MANAGE, Permission.STAFF_MANAGE],
  section: 'footer',
};

export function shouldShowNavItem(
  item: DashboardNavItem,
  options: {
    businessType: 'RESTAURANT' | 'CLOTHING';
    userPermissions: string[];
  },
): boolean {
  const { businessType, userPermissions } = options;
  if (item.businessTypes?.length && !item.businessTypes.includes(businessType)) {
    return false;
  }
  const required = item.requiredPermissions;
  if (!required?.length) return true;
  return hasAnyPermission(userPermissions, required as string[]);
}

export function menuLabel(businessType: 'RESTAURANT' | 'CLOTHING'): string {
  return businessType === 'CLOTHING' ? 'Products' : 'Menu';
}

export function getSidebarMainItems(
  businessType: 'RESTAURANT' | 'CLOTHING',
  userPermissions: string[],
): DashboardNavItem[] {
  const out: DashboardNavItem[] = [];
  const seen = new Set<string>();

  const push = (items: DashboardNavItem[]) => {
    for (const item of items) {
      if (!shouldShowNavItem(item, { businessType, userPermissions })) continue;
      if (item.section !== 'main') continue;
      if (seen.has(item.href)) continue;
      seen.add(item.href);
      const label =
        item.href === '/dashboard/menu' ? menuLabel(businessType) : item.label;
      out.push({ ...item, label });
    }
  };

  push(DASHBOARD_NAV_CORE);
  push(DASHBOARD_NAV_RESTAURANT);
  push(DASHBOARD_NAV_ADMIN);

  return out;
}
