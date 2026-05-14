import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateCategoryDto, CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { Permission } from '../rbac/permissions.constants';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('categories')
  @RequirePermissions(Permission.ALL, Permission.MENU_MANAGE)
  createCategory(@Request() req: any, @Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(req.tenantId, dto);
  }

  @Get('categories')
  @RequirePermissions(Permission.ALL, Permission.MENU_MANAGE, Permission.POS_ACCESS)
  getCategories(@Request() req: any) {
    return this.menuService.getCategories(req.tenantId);
  }

  @Post('items')
  @RequirePermissions(Permission.ALL, Permission.MENU_MANAGE)
  createMenuItem(@Request() req: any, @Body() dto: CreateMenuItemDto) {
    return this.menuService.createMenuItem(req.tenantId, dto);
  }

  @Get('items')
  @RequirePermissions(Permission.ALL, Permission.MENU_MANAGE, Permission.POS_ACCESS)
  getMenuItems(@Request() req: any) {
    return this.menuService.getMenuItems(req.tenantId);
  }

  @Patch('items/:id')
  @RequirePermissions(Permission.ALL, Permission.MENU_MANAGE)
  updateMenuItem(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.updateMenuItem(req.tenantId, id, dto);
  }

  @Delete('items/:id')
  @RequirePermissions(Permission.ALL, Permission.MENU_MANAGE)
  deleteMenuItem(@Request() req: any, @Param('id') id: string) {
    return this.menuService.deleteMenuItem(req.tenantId, id);
  }
}

