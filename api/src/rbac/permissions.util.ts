import { Permission } from './permissions.constants';

export type UserForPermissions = {
  roleId: string | null;
  role: { permissions: string[] } | null;
};

/** Same rule as AuthService.issueSession — owner with no Role row gets ALL. */
export function resolveEffectivePermissions(user: UserForPermissions): string[] {
  if (user.role?.permissions?.length) {
    return [...user.role.permissions];
  }
  if (!user.roleId) {
    return [Permission.ALL];
  }
  return [];
}

export function flattenPermissions(perms: string[] | undefined | null): string[] {
  return Array.isArray(perms) ? perms.filter(Boolean).map(String) : [];
}

/**
 * Grants access if JWT includes ALL or includes any of required permissions (OR).
 */
export function hasAnyGrantedPermission(userPermissions: string[], required: string[]): boolean {
  const u = flattenPermissions(userPermissions);
  const r = flattenPermissions(required);
  if (!r.length) return true;
  if (u.includes(Permission.ALL)) return true;
  return r.some((key) => u.includes(key));
}
