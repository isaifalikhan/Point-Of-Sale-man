import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { Permission } from '../rbac/permissions.constants';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @RequirePermissions(Permission.ALL, Permission.INVENTORY_MANAGE)
  getInventory(@Request() req: any) {
    return this.inventoryService.getInventory(req.tenantId);
  }

  @Get('stats')
  @RequirePermissions(Permission.ALL, Permission.INVENTORY_MANAGE)
  getStats(@Request() req: any) {
    return this.inventoryService.getInventoryStats(req.tenantId);
  }

  @Post()
  @RequirePermissions(Permission.ALL, Permission.INVENTORY_MANAGE)
  createIngredient(@Request() req: any, @Body() body: any) {
    return this.inventoryService.createIngredient(req.tenantId, body);
  }

  @Patch(':id/stock')
  @RequirePermissions(Permission.ALL, Permission.INVENTORY_MANAGE)
  updateStock(@Request() req: any, @Param('id') id: string, @Body() body: { amount: number }) {
    return this.inventoryService.updateStock(req.tenantId, id, body.amount);
  }

  @Get('recipe/:menuItemId')
  @RequirePermissions(Permission.ALL, Permission.INVENTORY_MANAGE, Permission.MENU_MANAGE)
  getRecipe(@Request() req: any, @Param('menuItemId') menuItemId: string) {
    return this.inventoryService.getMenuItemIngredients(req.tenantId, menuItemId);
  }

  @Post('recipe/:menuItemId')
  @RequirePermissions(Permission.ALL, Permission.INVENTORY_MANAGE, Permission.MENU_MANAGE)
  linkIngredient(
    @Request() req: any,
    @Param('menuItemId') menuItemId: string,
    @Body() body: { ingredientId: string; quantity: number },
  ) {
    return this.inventoryService.linkIngredientToMenuItem(req.tenantId, menuItemId, body);
  }
}
