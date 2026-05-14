import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/orders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { Permission } from '../rbac/permissions.constants';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @RequirePermissions(Permission.ALL, Permission.POS_ACCESS)
  createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.tenantId, req.user.sub, dto);
  }

  @Get()
  @RequirePermissions(
    Permission.ALL,
    Permission.POS_ACCESS,
    Permission.ORDERS_VIEW,
    Permission.KITCHEN_OPS,
  )
  getOrders(@Request() req: any, @Query('branchId') branchId?: string) {
    return this.ordersService.getOrders(req.tenantId, branchId);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.ALL, Permission.KITCHEN_OPS)
  updateOrderStatus(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(req.tenantId, id, dto);
  }

  @Patch(':id/items/:itemId/status')
  @RequirePermissions(Permission.ALL, Permission.KITCHEN_OPS)
  updateOrderItemStatus(
    @Request() req: any,
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Body() body: { status: any },
  ) {
    return this.ordersService.updateOrderItemStatus(req.tenantId, orderId, itemId, body.status);
  }
}
