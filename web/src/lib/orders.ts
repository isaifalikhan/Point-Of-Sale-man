export type OrderRecord = {
  id: string;
  orderNumber: string;
  type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
  deliveryRiderName?: string | null;
  deliveryPhone?: string | null;
  deliveryAddress?: string | null;
  user?: { id: string; name: string; email?: string } | null;
  table?: { id: string; name: string } | null;
  items?: Array<{
    id: string;
    quantity: number;
    price: number;
    variantName?: string | null;
    addonNames?: string[];
    status?: string;
    item?: { id: string; name: string };
  }>;
  payments?: Array<{
    id: string;
    amount: number;
    method: string;
    status?: string;
    createdAt: string;
  }>;
};

export function getOrderPaidAmount(order: OrderRecord): number {
  return (order.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
}

export function isOrderFullyPaid(order: OrderRecord): boolean {
  return getOrderPaidAmount(order) >= (order.totalAmount || 0);
}

export type PaymentStatusLabel = 'PAID' | 'PARTIAL' | 'UNPAID' | 'CANCELLED';

export function getPaymentStatus(order: OrderRecord): PaymentStatusLabel {
  if (order.status === 'CANCELLED') return 'CANCELLED';
  const paid = getOrderPaidAmount(order);
  const total = order.totalAmount || 0;
  if (paid >= total && total > 0) return 'PAID';
  if (paid > 0) return 'PARTIAL';
  return 'UNPAID';
}

export function formatPaymentMethod(method: string): string {
  const labels: Record<string, string> = {
    CASH: 'Cash',
    CARD: 'Card',
    WALLET: 'Wallet',
    EASYPAISA: 'Easypaisa',
    JAZZCASH: 'JazzCash',
    BANK_TRANSFER: 'Bank transfer',
  };
  return labels[method] || method.replace(/_/g, ' ');
}

export function formatOrderType(type: string): string {
  return type.replace(/_/g, ' ');
}

export function formatOrderStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function lineItemLabel(item: NonNullable<OrderRecord['items']>[number]): string {
  const name = item.item?.name || 'Item';
  const parts = [name];
  if (item.variantName) parts.push(`(${item.variantName})`);
  if (item.addonNames && item.addonNames.length > 0) {
    parts.push(`+ ${item.addonNames.join(', ')}`);
  }
  return parts.join(' ');
}

export function buildOrderTimeline(order: OrderRecord): Array<{
  key: string;
  label: string;
  detail?: string;
  at: string;
}> {
  const events: Array<{ key: string; label: string; detail?: string; at: string }> = [];

  events.push({
    key: 'created',
    label: 'Order placed (POS)',
    detail: order.user?.name ? `Cashier: ${order.user.name}` : undefined,
    at: order.createdAt,
  });

  if (order.type === 'DELIVERY' && order.deliveryRiderName) {
    events.push({
      key: 'delivery',
      label: 'Delivery details',
      detail: `${order.deliveryRiderName} · ${order.deliveryPhone || ''} · ${order.deliveryAddress || ''}`,
      at: order.createdAt,
    });
  }

  if (order.table?.name) {
    events.push({
      key: 'table',
      label: 'Table assigned',
      detail: order.table.name,
      at: order.createdAt,
    });
  }

  events.push({
    key: 'kitchen',
    label: `Kitchen status: ${formatOrderStatus(order.status)}`,
    detail:
      order.status === 'COMPLETED'
        ? 'Marked complete in kitchen'
        : 'Awaiting or in progress in kitchen',
    at: order.completedAt || order.updatedAt || order.createdAt,
  });

  for (const payment of [...(order.payments || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )) {
    events.push({
      key: `pay-${payment.id}`,
      label: `Payment — ${formatPaymentMethod(payment.method)}`,
      detail: `Rs ${payment.amount.toLocaleString()}`,
      at: payment.createdAt,
    });
  }

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}
