import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableStatusDto, UpdateTableDto } from './dto/tables.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { Permission } from '../rbac/permissions.constants';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @RequirePermissions(Permission.ALL, Permission.TABLES_MANAGE)
  createTable(@Request() req: any, @Body() dto: CreateTableDto) {
    return this.tablesService.createTable(req.tenantId, dto);
  }

  @Get()
  @RequirePermissions(Permission.ALL, Permission.POS_ACCESS, Permission.TABLES_MANAGE, Permission.KITCHEN_OPS)
  getTables(@Request() req: any) {
    return this.tablesService.getTables(req.tenantId);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.ALL, Permission.TABLES_MANAGE, Permission.POS_ACCESS)
  updateTableStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTableStatusDto,
  ) {
    return this.tablesService.updateTableStatus(req.tenantId, id, dto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.ALL, Permission.TABLES_MANAGE)
  updateTable(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tablesService.updateTable(req.tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.ALL, Permission.TABLES_MANAGE)
  deleteTable(@Request() req: any, @Param('id') id: string) {
    return this.tablesService.deleteTable(req.tenantId, id);
  }
}
