import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TenantGuard } from './auth/tenant.guard';
import { PermissionsGuard } from './rbac/permissions.guard';
import { RequirePermissions } from './rbac/require-permissions.decorator';
import { Permission } from './rbac/permissions.constants';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
  @RequirePermissions(Permission.ALL, Permission.POS_ACCESS)
  @Get('branches')
  async getBranches(@Request() req: any) {
    return this.prisma.branch.findMany({
      where: { tenantId: req.tenantId },
    });
  }
}
