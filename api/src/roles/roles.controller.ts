import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { Permission } from '../rbac/permissions.constants';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/roles.dto';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /** Static labels for UI (checkboxes); no RBAC gate so staff forms can hydrate before role save flows. */
  @Get('catalog')
  catalog() {
    return this.rolesService.getPermissionCatalog();
  }

  @Get()
  @RequirePermissions(Permission.ALL, Permission.STAFF_MANAGE)
  list(@Request() req: { tenantId: string }) {
    return this.rolesService.list(req.tenantId);
  }

  @Post()
  @RequirePermissions(Permission.ALL, Permission.STAFF_MANAGE)
  create(@Request() req: { tenantId: string }, @Body() dto: CreateRoleDto) {
    return this.rolesService.create(req.tenantId, dto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.ALL, Permission.STAFF_MANAGE)
  update(
    @Request() req: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.ALL, Permission.STAFF_MANAGE)
  remove(@Request() req: { tenantId: string }, @Param('id') id: string) {
    return this.rolesService.remove(req.tenantId, id);
  }
}
