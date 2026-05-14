import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TenantGuard } from './tenant.guard';
import { CreateStaffDto, LoginPinDto } from './dto/staff.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { Permission } from '../rbac/permissions.constants';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { RolesService } from '../roles/roles.service';
import { UpdateStaffDto } from './dto/update-staff.dto';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('auth/staff')
export class StaffController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly rolesService: RolesService,
  ) {}

  @Get()
  @RequirePermissions(Permission.ALL, Permission.STAFF_MANAGE)
  async getStaff(@Request() req: { tenantId: string }) {
    return this.prisma.user.findMany({
      where: { tenantId: req.tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        pin: true,
        shifts: {
          orderBy: { startTime: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    }).then((rows) =>
      rows.map(({ pin, ...rest }) => ({
        ...rest,
        hasPin: Boolean(pin),
      })),
    );
  }

  @Post()
  @RequirePermissions(Permission.ALL, Permission.STAFF_MANAGE)
  async createStaff(@Request() req: { tenantId: string }, @Body() dto: CreateStaffDto) {
    if (dto.roleId) {
      await this.rolesService.assertRoleInTenant(dto.roleId, req.tenantId);
    }
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const created = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          tenantId: req.tenantId,
          roleId: dto.roleId || undefined,
          pin: dto.pin || undefined,
        },
        select: {
          id: true,
          email: true,
          name: true,
          roleId: true,
          role: true,
          createdAt: true,
          pin: true,
        },
      });
      const { pin, ...rest } = created;
      return { ...rest, hasPin: Boolean(pin) };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'An account with this email address already exists. Use a unique email.',
        );
      }
      throw new BadRequestException(error.message || 'Could not create staff member.');
    }
  }

  @Post('login-pin')
  async loginPin(@Request() req: { tenantId: string }, @Body() dto: LoginPinDto) {
    return this.authService.pinLogin(dto.pin, req.tenantId);
  }

  @Patch(':id')
  @RequirePermissions(Permission.ALL, Permission.STAFF_MANAGE)
  async updateStaff(
    @Request() req: { tenantId: string; user: { sub: string } },
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    const existing = await this.prisma.user.findFirst({
      where: { id, tenantId: req.tenantId },
    });
    if (!existing) {
      throw new BadRequestException('Team member not found.');
    }

    const data: Record<string, unknown> = {};

    if (dto.roleId !== undefined) {
      if (dto.roleId === '') {
        data.roleId = null;
      } else {
        await this.rolesService.assertRoleInTenant(dto.roleId, req.tenantId);
        data.roleId = dto.roleId;
      }
    }

    const pinUnset = dto.pin !== undefined && dto.pin.trim() === '';
    const pinProvided =
      dto.pin !== undefined && dto.pin.trim() !== '' && dto.pin.trim().length > 0;

    if (pinProvided && dto.pin !== undefined && !/^[0-9]{4}$/.test(dto.pin.trim())) {
      throw new BadRequestException('PIN must be exactly four digits.');
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (pinUnset) data.pin = null;
    else if (pinProvided && dto.pin !== undefined) data.pin = dto.pin.trim();
    if (passwordHash) data.password = passwordHash;

    if (Object.keys(data).length === 0) {
      return this.prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          roleId: true,
          role: true,
          createdAt: true,
        },
      });
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: data as any,
        select: {
          id: true,
          email: true,
          name: true,
          roleId: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('That email address is already in use.');
      }
      throw new BadRequestException(error.message || 'Could not update team member.');
    }
  }

  @Delete(':id')
  @RequirePermissions(Permission.ALL, Permission.STAFF_MANAGE)
  async deleteStaff(@Request() req: { tenantId: string; user: { sub: string } }, @Param('id') id: string) {
    if (req.user.sub === id) {
      throw new ForbiddenException('You cannot remove your own account.');
    }

    const existing = await this.prisma.user.findFirst({
      where: { id, tenantId: req.tenantId },
    });
    if (!existing) {
      throw new BadRequestException('Team member not found.');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  @Post('clock-in')
  @RequirePermissions(Permission.ALL, Permission.POS_ACCESS)
  clockIn(@Request() req: { tenantId: string; user: { sub: string } }) {
    return this.prisma.shift.create({
      data: {
        userId: req.user.sub,
        tenantId: req.tenantId,
        status: 'ACTIVE',
      },
    });
  }

  @Post('clock-out')
  @RequirePermissions(Permission.ALL, Permission.POS_ACCESS)
  async clockOut(@Request() req: { tenantId: string; user: { sub: string } }) {
    const activeShift = await this.prisma.shift.findFirst({
      where: { userId: req.user.sub, tenantId: req.tenantId, status: 'ACTIVE' },
    });

    if (!activeShift) return { success: false, message: 'No active shift' };

    return this.prisma.shift.update({
      where: { id: activeShift.id },
      data: {
        status: 'CLOSED',
        endTime: new Date(),
      },
    });
  }
}
