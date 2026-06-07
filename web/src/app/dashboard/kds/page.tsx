'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  MapPin,
  ChefHat,
  Timer,
  Loader2,
  Bike,
  Play,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

type KitchenTicket = {
  orderId: string;
  orderNumber: string;
  orderType: string;
  orderStatus: string;
  createdAt: string;
  tableName?: string;
  deliveryRiderName?: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  orderItem: {
    id: string;
    quantity: number;
    status: string;
    variantName?: string;
    addonNames?: string[];
    notes?: string;
    item: { name: string };
  };
};

function getElapsedMinutes(createdAt: string) {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  return Math.max(0, diff);
}

function itemStatusColor(status: string) {
  switch (status) {
    case 'PREPARING':
      return 'border-blue-500 bg-blue-50';
    case 'COMPLETED':
      return 'border-emerald-500 bg-emerald-50';
    default:
      return 'border-amber-500 bg-amber-50';
  }
}

function ordersToTickets(orders: any[]): KitchenTicket[] {
  return orders.flatMap((order) =>
    (order.items || []).map((orderItem: any) => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderType: order.type,
      orderStatus: order.status,
      createdAt: order.createdAt,
      tableName: order.table?.name,
      deliveryRiderName: order.deliveryRiderName,
      deliveryPhone: order.deliveryPhone,
      deliveryAddress: order.deliveryAddress,
      orderItem,
    })),
  );
}

export default function KDSPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await apiClient.get('/orders');
      const activeOrders = (res.data || []).filter(
        (o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED',
      );
      setOrders(activeOrders);
    } catch (error) {
      console.error('Error fetching KDS orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const tickets = useMemo(() => ordersToTickets(orders), [orders]);

  const activeTickets = useMemo(
    () => tickets.filter((t) => t.orderItem.status !== 'COMPLETED'),
    [tickets],
  );

  const pendingCount = activeTickets.filter((t) => t.orderItem.status === 'PENDING').length;
  const preparingCount = activeTickets.filter((t) => t.orderItem.status === 'PREPARING').length;

  const maybeCompleteOrder = async (orderId: string) => {
    const res = await apiClient.get('/orders');
    const order = (res.data || []).find((o: any) => o.id === orderId);
    if (!order?.items?.length) return;
    const allDone = order.items.every((i: any) => i.status === 'COMPLETED');
    if (allDone) {
      await apiClient.patch(`/orders/${orderId}/status`, { status: 'COMPLETED' });
    } else if (
      order.status === 'PENDING' &&
      order.items.some((i: any) => i.status === 'PREPARING')
    ) {
      await apiClient.patch(`/orders/${orderId}/status`, { status: 'PREPARING' });
    }
  };

  const advanceItem = async (ticket: KitchenTicket) => {
    const current = ticket.orderItem.status || 'PENDING';
    const next =
      current === 'PENDING' ? 'PREPARING' : current === 'PREPARING' ? 'COMPLETED' : 'PENDING';

    setUpdatingId(ticket.orderItem.id);
    try {
      await apiClient.patch(
        `/orders/${ticket.orderId}/items/${ticket.orderItem.id}/status`,
        { status: next },
      );
      if (next === 'COMPLETED') {
        await maybeCompleteOrder(ticket.orderId);
      } else if (next === 'PREPARING') {
        await maybeCompleteOrder(ticket.orderId);
      }
      await fetchOrders();
    } catch (error) {
      console.error('Error updating item status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const actionLabel = (status: string) => {
    if (status === 'PENDING') return 'Start this dish';
    if (status === 'PREPARING') return 'Mark dish done';
    return 'Reset dish';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
          Loading kitchen queue…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <ChefHat className="h-6 w-6 text-amber-400 shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Kitchen Display</h1>
            <p className="text-xs text-slate-400 mt-0.5">One ticket per item — not grouped by order</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            Waiting ({pendingCount})
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            Cooking ({preparingCount})
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            Tickets: {activeTickets.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {activeTickets.map((ticket) => {
          const item = ticket.orderItem;
          const mins = getElapsedMinutes(ticket.createdAt);
          const isUpdating = updatingId === item.id;

          return (
            <Card
              key={`${ticket.orderId}-${item.id}`}
              className={`shadow-md border-t-8 flex flex-col ${itemStatusColor(item.status)} animate-in fade-in duration-300`}
            >
              <CardHeader className="pb-2 px-4 pt-3 bg-white space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-black text-lg text-slate-900">#{ticket.orderNumber}</span>
                  <span
                    className={`text-xs font-bold flex items-center gap-1 shrink-0 ${mins > 15 ? 'text-red-500' : 'text-slate-500'}`}
                  >
                    <Timer className="h-3.5 w-3.5" /> {mins}m
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {ticket.tableName || 'Quick service'}
                  </span>
                  <Badge variant={ticket.orderType === 'DINE_IN' ? 'default' : 'secondary'} className="text-[10px]">
                    {ticket.orderType.replace('_', ' ')}
                  </Badge>
                </div>
                {ticket.orderType === 'DELIVERY' && ticket.deliveryRiderName && (
                  <p className="text-[10px] text-indigo-700 font-semibold flex items-center gap-1">
                    <Bike className="h-3 w-3" />
                    {ticket.deliveryRiderName}
                    {ticket.deliveryPhone ? ` · ${ticket.deliveryPhone}` : ''}
                  </p>
                )}
              </CardHeader>

              <CardContent className="px-4 py-3 flex-1 bg-white">
                <div className="flex items-start gap-3">
                  <span className="font-black text-2xl w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-indigo-100 text-indigo-800">
                    {item.quantity}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-lg leading-tight">
                      {item.item?.name || 'Item'}
                    </div>
                    {item.variantName && (
                      <div className="text-xs font-bold text-indigo-600 uppercase mt-0.5">
                        {item.variantName}
                      </div>
                    )}
                    {item.addonNames?.length > 0 && (
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                        + {item.addonNames.join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-xs text-red-600 font-bold mt-1">*** {item.notes} ***</p>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-0 border-t bg-slate-50">
                <Button
                  className={`w-full rounded-none rounded-b-lg h-12 font-black text-sm uppercase tracking-wide ${
                    item.status === 'PREPARING'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                  disabled={isUpdating}
                  onClick={() => advanceItem(ticket)}
                >
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : item.status === 'PREPARING' ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {actionLabel(item.status)}
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      {actionLabel(item.status)}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {activeTickets.length === 0 && !loading && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-300">
            <CheckCircle2 className="h-16 w-16 mb-4 opacity-10" />
            <p className="text-xl font-medium">All caught up — no dishes waiting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
