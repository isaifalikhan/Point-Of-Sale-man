import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Permission, PERMISSION_CATALOG } from '../rbac/permissions.constants';
import { CreateRoleDto, UpdateRoleDto } from './dto/roles.dto';

const VALID_KEYS = new Set<string>(PERMISSION_CATALOG.map((p) => p.key));

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  getPermissionCatalog() {
    return PERMISSION_CATALOG;
  }

  async ensureDefaultRoles(tenantId: string) {
    const count = await this.prisma.role.count({ where: { tenantId } });
    if (count > 0) return;

    const defaults: { name: string; permissions: string[]; isSystem: boolean }[] = [
      {
        name: 'Manager',
        permissions: [Permission.ALL],
        isSystem: true,
      },
      {
        name: 'Cashier',
        permissions: [Permission.POS_ACCESS, Permission.ORDERS_VIEW],
        isSystem: true,
      },
      {
        name: 'Floor staff',
        permissions: [Permission.POS_ACCESS],
        isSystem: true,
      },
      {
        name: 'Kitchen',
        permissions: [Permission.KITCHEN_OPS, Permission.ORDERS_VIEW],
        isSystem: true,
      },
    ];

    for (const row of defaults) {
      await this.prisma.role.create({
        data: { ...row, tenantId },
      });
    }
  }

  private validatePermissionList(keys: string[]): string[] {
    const bad = keys.filter((k) => !VALID_KEYS.has(k));
    if (bad.length > 0) {
      throw new BadRequestException(`Unknown permission keys: ${bad.join(', ')}`);
    }
    return [...new Set(keys)];
  }

  async list(tenantId: string) {
    await this.ensureDefaultRoles(tenantId);
    return this.prisma.role.findMany({
      where: { tenantId },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        permissions: true,
        isSystem: true,
        tenantId: true,
        _count: { select: { users: true } },
      },
    });
  }

  async create(tenantId: string, dto: CreateRoleDto) {
    const permissions = this.validatePermissionList(dto.permissions);
    if (!permissions.includes(Permission.ALL) && permissions.length === 0) {
      throw new BadRequestException('Select at least one permission (or ALL).');
    }

    const trimmed = dto.name.trim();
    const dupe = await this.prisma.role.findFirst({
      where: {
        tenantId,
        name: trimmed,
      },
    });
    if (dupe) {
      throw new BadRequestException('A role with this name already exists.');
    }

    return this.prisma.role.create({
      data: {
        name: trimmed,
        permissions,
        tenantId,
        isSystem: false,
      },
      select: {
        id: true,
        name: true,
        permissions: true,
        isSystem: true,
        tenantId: true,
        _count: { select: { users: true } },
      },
    });
  }

  async update(tenantId: string, roleId: string, dto: UpdateRoleDto) {
    const existing = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Role not found.');
    }

    let permissions = existing.permissions;
    if (dto.permissions !== undefined) {
      permissions = this.validatePermissionList(dto.permissions);
      if (!permissions.includes(Permission.ALL) && permissions.length === 0) {
        throw new BadRequestException('Select at least one permission (or ALL).');
      }
    }

    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      const dupe = await this.prisma.role.findFirst({
        where: {
          tenantId,
          id: { not: roleId },
          name: trimmed,
        },
      });
      if (dupe) {
        throw new BadRequestException('A role with this name already exists.');
      }
      return this.prisma.role.update({
        where: { id: existing.id },
        data: {
          name: trimmed,
          permissions,
        },
        select: {
          id: true,
          name: true,
          permissions: true,
          isSystem: true,
          tenantId: true,
          _count: { select: { users: true } },
        },
      });
    }

    return this.prisma.role.update({
      where: { id: existing.id },
      data: { permissions },
      select: {
        id: true,
        name: true,
        permissions: true,
        isSystem: true,
        tenantId: true,
        _count: { select: { users: true } },
      },
    });
  }

  async remove(tenantId: string, roleId: string) {
    const existing = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId },
      include: { _count: { select: { users: true } } },
    });
    if (!existing) {
      throw new NotFoundException('Role not found.');
    }
    if (existing.isSystem) {
      throw new BadRequestException(
        'Built-in role presets cannot be deleted. Create a custom role instead.',
      );
    }
    if (existing._count.users > 0) {
      throw new BadRequestException(
        'Assign those users another role before deleting this preset.',
      );
    }

    await this.prisma.role.delete({ where: { id: roleId } });
    return { success: true };
  }

  async assertRoleInTenant(roleId: string, tenantId: string) {
    const r = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId },
    });
    if (!r) throw new BadRequestException('Invalid role selection.');
  }
}
