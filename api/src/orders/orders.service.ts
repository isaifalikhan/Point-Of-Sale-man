import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddOrderItemsDto,
  CheckoutOrderDto,
  CreateOrderDto,
  OrderHistoryQueryDto,
  UpdateOrderStatusDto,
} from './dto/orders.dto';
import type { CreateOrderItemDto } from './dto/orders.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private buildOrderLines(items: CreateOrderItemDto[], menuItems: { id: string; price: number; variants: unknown; addons: unknown }[]) {
    let addedTotal = 0;
    const orderItemsData = items.map((itemDto) => {
      const menuItem = menuItems.find((mi) => mi.id === itemDto.itemId);
      if (!menuItem) throw new BadRequestException(`Item ${itemDto.itemId} not found`);

      let itemPrice = menuItem.price;

      if (itemDto.variantName && menuItem.variants) {
        const variant = (menuItem.variants as { name: string; price: number }[]).find(
          (v) => v.name === itemDto.variantName,
        );
        if (variant) itemPrice = variant.price;
      }

      if (itemDto.addonNames && menuItem.addons) {
        const selectedAddons = (menuItem.addons as { name: string; price: number }[]).filter((a) =>
          itemDto.addonNames?.includes(a.name),
        );
        itemPrice += selectedAddons.reduce((sum, a) => sum + a.price, 0);
      }

      addedTotal += itemPrice * itemDto.quantity;

      return {
        itemId: itemDto.itemId,
        quantity: itemDto.quantity,
        price: itemPrice,
        variantName: itemDto.variantName,
        addonNames: itemDto.addonNames || [],
        notes: itemDto.notes,
      };
    });

    return { orderItemsData, addedTotal };
  }

  async createOrder(tenantId: string, userId: string, dto: CreateOrderDto) {
    // 1. Verify branch belongs to tenant
    const branch = await this.prisma.branch.findFirst({
      where: { id: dto.branchId, tenantId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // 2. Fetch all menu items simultaneously to verify they exist and calculate price
    const itemIds = dto.items.map(i => i.itemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: itemIds }, tenantId },
      include: { ingredients: true }
    });

    if (menuItems.length !== itemIds.length) {
      throw new BadRequestException('One or more menu items are invalid or not available');
    }

    if (dto.type === 'DELIVERY') {
      const rider = dto.deliveryRiderName?.trim();
      const phone = dto.deliveryPhone?.trim();
      const address = dto.deliveryAddress?.trim();
      if (!rider || !phone || !address) {
        throw new BadRequestException(
          'Delivery orders require rider name, customer cell number, and delivery address',
        );
      }
    }

    const { orderItemsData, addedTotal: totalAmount } = this.buildOrderLines(dto.items, menuItems);

    // 4. Generate order number
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Create Order and Payment
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        type: dto.type,
        totalAmount,
        userId,
        tableId: dto.tableId && dto.tableId.length > 0 ? dto.tableId : undefined,
        branchId: dto.branchId,
        deliveryRiderName:
          dto.type === 'DELIVERY' ? dto.deliveryRiderName?.trim() : undefined,
        deliveryPhone: dto.type === 'DELIVERY' ? dto.deliveryPhone?.trim() : undefined,
        deliveryAddress:
          dto.type === 'DELIVERY' ? dto.deliveryAddress?.trim() : undefined,
        items: {
          create: orderItemsData,
        },
        payments: dto.payments && dto.payments.length > 0 ? {
          create: dto.payments.map(p => ({
            amount: p.amount,
            method: p.method,
          }))
        } : undefined,
      },

      include: {
        items: { include: { item: true } },
        payments: true,
      }
    });

    if (dto.type === 'DINE_IN' && dto.tableId && dto.tableId.length > 0) {
      await this.prisma.table.update({
        where: { id: dto.tableId },
        data: { status: 'OCCUPIED' }
      });
    }

    // 6. Auto-Deduct Inventory
    try {
       for (const orderItem of orderItemsData) {
          const matchedMenuItem = menuItems.find(mi => mi.id === orderItem.itemId);
          if (matchedMenuItem && matchedMenuItem.ingredients && matchedMenuItem.ingredients.length > 0) {
             for (const recipeLink of matchedMenuItem.ingredients) {
                const totalDeduction = recipeLink.quantity * orderItem.quantity;
                await this.prisma.ingredient.updateMany({
                   where: { id: recipeLink.ingredientId },
                   data: {
                      currentStock: { decrement: totalDeduction }
                   }
                });
             }
          }
       }
    } catch (invErr) {
       console.error("Non-fatal inventory deduct error:", invErr);
    }

    return order;

  }

  async addItemsToOrder(tenantId: string, orderId: string, dto: AddOrderItemsDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branch: { tenantId } },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot add items to a cancelled order');
    }

    const alreadyPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    if (alreadyPaid >= order.totalAmount) {
      throw new BadRequestException('Order is already paid; start a new order instead');
    }

    if (!dto.items?.length) {
      throw new BadRequestException('At least one item is required');
    }

    const itemIds = dto.items.map((i) => i.itemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: itemIds }, tenantId },
      include: { ingredients: true },
    });

    if (menuItems.length !== itemIds.length) {
      throw new BadRequestException('One or more menu items are invalid or not available');
    }

    const { orderItemsData, addedTotal } = this.buildOrderLines(dto.items, menuItems);

    const reopenKitchen = order.status === 'COMPLETED';

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        totalAmount: order.totalAmount + addedTotal,
        ...(reopenKitchen
          ? { status: 'PENDING', completedAt: null }
          : {}),
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: { include: { item: true } },
        payments: true,
        table: true,
      },
    });

    try {
      for (const orderItem of orderItemsData) {
        const matchedMenuItem = menuItems.find((mi) => mi.id === orderItem.itemId);
        if (matchedMenuItem?.ingredients?.length) {
          for (const recipeLink of matchedMenuItem.ingredients) {
            const totalDeduction = recipeLink.quantity * orderItem.quantity;
            await this.prisma.ingredient.updateMany({
              where: { id: recipeLink.ingredientId },
              data: { currentStock: { decrement: totalDeduction } },
            });
          }
        }
      }
    } catch (invErr) {
      console.error('Non-fatal inventory deduct error:', invErr);
    }

    return updated;
  }

  async removeOrderItem(tenantId: string, orderId: string, orderItemId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branch: { tenantId } },
      include: { payments: true, items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot modify a cancelled order');
    }

    const alreadyPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    if (alreadyPaid >= order.totalAmount) {
      throw new BadRequestException('Order is already paid');
    }

    const line = order.items.find((i) => i.id === orderItemId);
    if (!line) {
      throw new NotFoundException('Order item not found');
    }

    await this.prisma.orderItem.delete({ where: { id: orderItemId } });

    const remaining = order.items.filter((i) => i.id !== orderItemId);
    const newTotal = remaining.reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (remaining.length === 0) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', totalAmount: 0, completedAt: null },
      });
      if (order.type === 'DINE_IN' && order.tableId) {
        await this.prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' },
        });
      }
      return null;
    }

    const reopenKitchen = order.status === 'COMPLETED';

    return this.prisma.order.update({
      where: { id: order.id },
      data: {
        totalAmount: newTotal,
        ...(reopenKitchen ? { status: 'PENDING', completedAt: null } : {}),
      },
      include: this.orderInclude(),
    });
  }

  async getOrders(tenantId: string, branchId?: string) {
    return this.prisma.order.findMany({
      where: {
        branch: { tenantId },
        ...(branchId ? { branchId } : {}),
      },
      include: this.orderInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  private orderInclude() {
    return {
      items: { include: { item: true }, orderBy: { id: 'asc' as const } },
      table: true,
      user: { select: { id: true, name: true, email: true } },
      payments: { orderBy: { createdAt: 'asc' as const } },
      branch: { select: { id: true, name: true } },
    };
  }

  private buildHistoryWhere(tenantId: string, query: OrderHistoryQueryDto) {
    const where: Record<string, unknown> = {
      branch: { tenantId },
    };

    if (query.branchId) where.branchId = query.branchId;
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.search?.trim()) {
      where.orderNumber = { contains: query.search.trim(), mode: 'insensitive' };
    }
    if (query.from || query.to) {
      const createdAt: Record<string, Date> = {};
      if (query.from) {
        const from = new Date(query.from);
        from.setHours(0, 0, 0, 0);
        createdAt.gte = from;
      }
      if (query.to) {
        const to = new Date(query.to);
        to.setHours(23, 59, 59, 999);
        createdAt.lte = to;
      }
      where.createdAt = createdAt;
    }

    return where;
  }

  async getOrderHistory(tenantId: string, query: OrderHistoryQueryDto) {
    const where = this.buildHistoryWhere(tenantId, query);
    const limit = query.limit ?? 200;
    const skip = query.skip ?? 0;

    const [orders, totalCount] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: this.orderInclude(),
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.order.count({ where }),
    ]);

    let totalBilled = 0;
    let totalCollected = 0;
    let unpaidCount = 0;
    let paidCount = 0;

    for (const order of orders) {
      totalBilled += order.totalAmount || 0;
      const paid = order.payments.reduce((s, p) => s + p.amount, 0);
      totalCollected += paid;
      if (paid >= (order.totalAmount || 0) && order.status !== 'CANCELLED') {
        paidCount += 1;
      } else if (order.status !== 'CANCELLED') {
        unpaidCount += 1;
      }
    }

    return {
      orders,
      totalCount,
      summary: {
        shown: orders.length,
        totalBilled,
        totalCollected,
        unpaidCount,
        paidCount,
      },
    };
  }

  async updateOrderStatus(tenantId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branch: { tenantId } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        ...(dto.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });
  }

  async updateOrderItemStatus(tenantId: string, orderId: string, itemId: string, status: any) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branch: { tenantId } },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.prisma.orderItem.update({
      where: { id: itemId, orderId },
      data: { status },
    });

    const items = order.items.map((i) => (i.id === itemId ? { ...i, status } : i));
    const allCompleted = items.every((i) => i.status === 'COMPLETED');
    const anyPreparing = items.some((i) => i.status === 'PREPARING');

    if (allCompleted) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    } else if (anyPreparing && order.status === 'PENDING') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PREPARING' },
      });
    }

    return this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { item: true },
    });
  }

  async checkoutOrder(tenantId: string, orderId: string, dto: CheckoutOrderDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branch: { tenantId } },
      include: { payments: true, items: { include: { item: true } } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!dto.payments || dto.payments.length === 0) {
      throw new BadRequestException('At least one payment is required');
    }

    const incomingPaid = dto.payments.reduce((sum, p) => sum + p.amount, 0);

    if (dto.readyItemsOnly) {
      const readyItems = order.items.filter((i) => i.status === 'COMPLETED');
      if (readyItems.length === 0) {
        throw new BadRequestException('No kitchen-ready items to pay for yet');
      }

      const readyTotal = readyItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      if (incomingPaid < readyTotal) {
        throw new BadRequestException(
          `Insufficient payment for ready dishes. Required: ${readyTotal}, got: ${incomingPaid}`,
        );
      }

      await this.prisma.payment.createMany({
        data: dto.payments.map((p) => ({
          orderId: order.id,
          amount: p.amount,
          method: p.method,
          status: 'COMPLETED',
        })),
      });

      await this.prisma.orderItem.deleteMany({
        where: { id: { in: readyItems.map((i) => i.id) } },
      });

      const remaining = order.items.filter((i) => i.status !== 'COMPLETED');
      const newTotal = remaining.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const anyPreparing = remaining.some((i) => i.status === 'PREPARING');

      if (remaining.length === 0) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED', totalAmount: 0, completedAt: new Date() },
        });
        if (order.type === 'DINE_IN' && order.tableId) {
          await this.prisma.table.update({
            where: { id: order.tableId },
            data: { status: 'AVAILABLE' },
          });
        }
      } else {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            totalAmount: newTotal,
            status: anyPreparing ? 'PREPARING' : 'PENDING',
            completedAt: null,
          },
        });
      }

      return this.prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: { include: { item: true } },
          payments: true,
          table: true,
        },
      });
    }

    const allItemsDone =
      order.items.length > 0 && order.items.every((i) => i.status === 'COMPLETED');

    if (order.status !== 'COMPLETED' && !allItemsDone) {
      throw new BadRequestException('Order must be completed by kitchen before checkout');
    }

    if (allItemsDone && order.status !== 'COMPLETED') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }

    const alreadyPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = alreadyPaid + incomingPaid;

    if (totalPaid < order.totalAmount) {
      throw new BadRequestException(
        `Insufficient payment. Required: ${order.totalAmount}, got: ${totalPaid}`,
      );
    }

    await this.prisma.payment.createMany({
      data: dto.payments.map((p) => ({
        orderId: order.id,
        amount: p.amount,
        method: p.method,
        status: 'COMPLETED',
      })),
    });

    if (order.type === 'DINE_IN' && order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    return this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { item: true } },
        payments: true,
        table: true,
      },
    });
  }
}
