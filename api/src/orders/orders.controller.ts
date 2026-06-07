import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  AddOrderItemsDto,
  CheckoutOrderDto,
  CreateOrderDto,
  OrderHistoryQueryDto,
  UpdateOrderStatusDto,
} from './dto/orders.dto';
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

  @Get('history')
  @RequirePermissions(
    Permission.ALL,
    Permission.POS_ACCESS,
    Permission.ORDERS_VIEW,
    Permission.ANALYTICS_VIEW,
  )
  getOrderHistory(@Request() req: any, @Query() query: OrderHistoryQueryDto) {
    return this.ordersService.getOrderHistory(req.tenantId, query);
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

  @Patch(':id/checkout')
  @RequirePermissions(Permission.ALL, Permission.POS_ACCESS)
  checkoutOrder(@Request() req: any, @Param('id') id: string, @Body() dto: CheckoutOrderDto) {
    return this.ordersService.checkoutOrder(req.tenantId, id, dto);
  }

  @Patch(':id/items')
  @RequirePermissions(Permission.ALL, Permission.POS_ACCESS)
  addItemsToOrder(@Request() req: any, @Param('id') id: string, @Body() dto: AddOrderItemsDto) {
    return this.ordersService.addItemsToOrder(req.tenantId, id, dto);
  }

  @Delete(':id/items/:orderItemId')
  @RequirePermissions(Permission.ALL, Permission.POS_ACCESS)
  removeOrderItem(
    @Request() req: any,
    @Param('id') orderId: string,
    @Param('orderItemId') orderItemId: string,
  ) {
    return this.ordersService.removeOrderItem(req.tenantId, orderId, orderItemId);
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
