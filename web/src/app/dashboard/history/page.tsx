'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  History,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  buildOrderTimeline,
  formatOrderStatus,
  formatOrderType,
  formatPaymentMethod,
  getOrderPaidAmount,
  getPaymentStatus,
  lineItemLabel,
  type OrderRecord,
} from '@/lib/orders';

type PeriodKey = 'today' | '7d' | '30d' | 'all';

type HistorySummary = {
  shown: number;
  totalBilled: number;
  totalCollected: number;
  unpaidCount: number;
  paidCount: number;
};

function periodRange(period: PeriodKey): { from?: string; to?: string } {
  if (period === 'all') return {};
  const to = new Date();
  const from = new Date();
  if (period === 'today') {
    /* same day */
  } else if (period === '7d') {
    from.setDate(from.getDate() - 6);
  } else {
    from.setDate(from.getDate() - 29);
  }
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'PREPARING':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'READY':
    case 'SERVED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
}

function paymentBadgeClass(status: ReturnType<typeof getPaymentStatus>) {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-600 text-white';
    case 'PARTIAL':
      return 'bg-amber-500 text-white';
    case 'CANCELLED':
      return 'bg-slate-400 text-white';
    default:
      return 'bg-rose-500 text-white';
  }
}

function OrderHistoryCard({
  order,
  expanded,
  onToggle,
}: {
  order: OrderRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  const paid = getOrderPaidAmount(order);
  const paymentStatus = getPaymentStatus(order);
  const timeline = buildOrderTimeline(order);
  const change =
    paid > (order.totalAmount || 0) ? paid - (order.totalAmount || 0) : 0;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5 hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {expanded ? (
              <ChevronDown className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            ) : (
              <ChevronRight className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-slate-900 text-lg">#{order.orderNumber}</span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadgeClass(order.status)}`}
                >
                  {formatOrderStatus(order.status)}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${paymentBadgeClass(paymentStatus)}`}
                >
                  {paymentStatus === 'PAID'
                    ? 'Paid'
                    : paymentStatus === 'PARTIAL'
                      ? 'Partial pay'
                      : paymentStatus === 'CANCELLED'
                        ? 'Cancelled'
                        : 'Unpaid'}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDateTime(order.createdAt)}
                </span>
                <span>{formatOrderType(order.type)}</span>
                {order.table?.name && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {order.table.name}
                  </span>
                )}
                {order.user?.name && (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {order.user.name}
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {(order.items || [])
                  .map((it) => `${it.quantity}× ${lineItemLabel(it)}`)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total</p>
            <p className="text-xl font-black text-primary">Rs {order.totalAmount?.toLocaleString()}</p>
            {paid > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">
                Collected Rs {paid.toLocaleString()}
                {change > 0 ? ` · Change Rs ${change.toLocaleString()}` : ''}
              </p>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <CardContent className="pt-0 pb-5 px-4 sm:px-5 border-t border-slate-100 bg-slate-50/50">
          <div className="grid gap-6 lg:grid-cols-2 pt-4">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                Items ordered
              </h4>
              <ul className="space-y-2">
                {(order.items || []).map((it) => (
                  <li
                    key={it.id}
                    className="flex justify-between gap-3 text-sm bg-white rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <span className="text-slate-800 font-medium">
                      <span className="font-black text-primary">{it.quantity}×</span>{' '}
                      {lineItemLabel(it)}
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">
                      Rs {(it.price * it.quantity).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-3">
                <span>Order total</span>
                <span>Rs {order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Activity timeline
                </h4>
                <ol className="relative border-l-2 border-indigo-100 pl-4 space-y-4">
                  {timeline.map((ev) => (
                    <li key={ev.key} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-white" />
                      <p className="text-sm font-bold text-slate-800">{ev.label}</p>
                      {ev.detail && <p className="text-xs text-slate-500 mt-0.5">{ev.detail}</p>}
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(ev.at)}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {(order.payments?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Payments
                  </h4>
                  <ul className="space-y-2">
                    {order.payments!.map((p) => (
                      <li
                        key={p.id}
                        className="flex justify-between items-center text-sm bg-white rounded-lg border border-slate-100 px-3 py-2"
                      >
                        <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                          <CreditCard className="h-4 w-4 text-indigo-500" />
                          {formatPaymentMethod(p.method)}
                        </span>
                        <span className="font-bold">Rs {p.amount.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {order.type === 'DELIVERY' && (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Delivery
                  </p>
                  <p>
                    <span className="text-slate-500">Rider:</span> {order.deliveryRiderName || '—'}
                  </p>
                  <p>
                    <span className="text-slate-500">Phone:</span> {order.deliveryPhone || '—'}
                  </p>
                  <p>
                    <span className="text-slate-500">Address:</span> {order.deliveryAddress || '—'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [summary, setSummary] = useState<HistorySummary | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const range = periodRange(period);
      const params: Record<string, string> = { limit: '200' };
      if (range.from) params.from = range.from;
      if (range.to) params.to = range.to;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await apiClient.get('/orders/history', { params });
      setOrders(res.data.orders || []);
      setSummary(res.data.summary || null);
      setTotalCount(res.data.totalCount ?? 0);
    } catch (error) {
      console.error('Failed to load order history:', error);
      try {
        const fallback = await apiClient.get('/orders');
        const list = (fallback.data || []) as OrderRecord[];
        setOrders(list);
        setTotalCount(list.length);
        setSummary(null);
      } catch {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [period, statusFilter, typeFilter, debouncedSearch]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const periodLabel = useMemo(() => {
    switch (period) {
      case 'today':
        return 'Today';
      case '7d':
        return 'Last 7 days';
      case '30d':
        return 'Last 30 days';
      default:
        return 'All time';
    }
  }, [period]);

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading order history…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600">
            <History className="h-6 w-6" />
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Order History</h1>
          </div>
          <p className="text-slate-500 mt-1">
            Complete POS activity — orders, items, kitchen status, and payments ({periodLabel}).
          </p>
        </div>
        <Button variant="outline" size="sm" className="bg-white shrink-0" onClick={() => fetchHistory()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Orders</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
            <p className="text-[10px] text-slate-400 mt-1">in selected period</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Billed</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              Rs {(summary?.totalBilled ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Collected</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              Rs {(summary?.totalCollected ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Unpaid</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{summary?.unpaidCount ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['today', 'Today'],
              ['7d', '7 days'],
              ['30d', '30 days'],
              ['all', 'All'],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={period === key ? 'default' : 'outline'}
              className={period === key ? 'premium-gradient border-none' : ''}
              onClick={() => setPeriod(key)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search order # (e.g. ORD-1234)"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            <option value="DINE_IN">Dine in</option>
            <option value="TAKEAWAY">Takeaway</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <ShoppingBag className="h-12 w-12 opacity-30 mb-4" />
          <p className="font-bold text-slate-500">No orders found for this period</p>
          <p className="text-sm mt-1">Try a wider date range or clear filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing {orders.length} of {totalCount} orders
          </p>
          {orders.map((order) => (
            <OrderHistoryCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId((id) => (id === order.id ? null : order.id))}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
        <Banknote className="h-3 w-3" />
        History is built from saved orders — each send to kitchen, item line, and checkout payment.
      </p>
    </div>
  );
}
