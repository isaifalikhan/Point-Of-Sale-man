import { SetMetadata } from '@nestjs/common';
import type { PermissionKey } from './permissions.constants';

export const REQUIRE_PERMISSIONS_KEY = 'requiredPermissions';

/** Callers must satisfy at least one of the listed permission keys or hold ALL (see guard). */
export const RequirePermissions = (...keys: PermissionKey[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, keys);
