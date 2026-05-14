import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { REQUIRE_PERMISSIONS_KEY } from './require-permissions.decorator';
import type { PermissionKey } from './permissions.constants';
import {
  flattenPermissions,
  hasAnyGrantedPermission,
  resolveEffectivePermissions,
} from './permissions.util';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(REQUIRE_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const jwtUser = request.user;
    const tokenPermissions = jwtUser?.permissions;

    /** Tokens minted before RBAC omit `permissions` — hydrate from DB once per request. */
    let perms: string[];
    if (tokenPermissions === undefined || tokenPermissions === null) {
      if (!jwtUser?.sub || !jwtUser?.tenantId) {
        throw new UnauthorizedException('Invalid authentication.');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: jwtUser.sub },
        include: { role: true },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      if (user.tenantId !== jwtUser.tenantId) {
        throw new ForbiddenException('Tenant mismatch.');
      }

      perms = resolveEffectivePermissions(user);
      jwtUser.permissions = perms;
    } else {
      perms = flattenPermissions(tokenPermissions);
    }

    if (!hasAnyGrantedPermission(perms, required)) {
      throw new ForbiddenException('Insufficient permissions for this resource.');
    }

    return true;
  }
}
