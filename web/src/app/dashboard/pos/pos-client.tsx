'use client';

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, ShoppingCart, Plus, Minus, Trash2, Loader2, CheckCircle2, Printer, X, ChefHat, Undo2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { useDebounce } from '@/hooks/use-debounce';
import {
  DeliveryDetailsFields,
  isDeliveryDetailsValid,
  type DeliveryDetails,
} from '@/components/pos/delivery-details-fields';
import { BRAND } from '@/config/brand';
import { VENUE } from '@/config/venue-public';
import { imageForCategory } from '@/lib/menu-category-images';

const EMPTY_DELIVERY: DeliveryDetails = { riderName: '', phone: '', address: '' };
type PaymentMethod = 'CASH' | 'CARD' | 'WALLET' | 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER';
const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'WALLET', label: 'Wallet' },
  { value: 'EASYPAISA', label: 'Easypaisa' },
  { value: 'JAZZCASH', label: 'JazzCash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
];

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  categoryId: string;
  variants?: { name: string; price: number }[];
  addons?: { name: string; price: number }[];
}

type CartLineStatus = 'in_cart' | 'in_kitchen';
type KitchenItemStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

interface CartLine {
  lineId: string;
  item: MenuItem;
  quantity: number;
  variantName?: string;
  addonNames?: string[];
  totalPrice: number;
  status: CartLineStatus;
  /** Set after the line is saved on the open kitchen order */
  orderItemId?: string;
  /** Kitchen ticket progress — synced from KDS mark dish done */
  kitchenStatus?: KitchenItemStatus;
}

function kitchenStatusLabel(status?: KitchenItemStatus) {
  switch (status) {
    case 'PREPARING':
      return 'Cooking';
    case 'COMPLETED':
      return 'Done';
    default:
      return 'Waiting';
  }
}

/** Sync kitchen lines from server — keeps stable lineIds and updates mark-dish-done status */
function mergeCartWithOrder(
  prev: CartLine[],
  orderItems: any[],
  menuItems: MenuItem[],
): CartLine[] {
  const inCart = prev.filter((l) => l.status === 'in_cart');
  const inCartSigs = new Set(inCart.map((l) => cartLineSignature(l)));
  const serverLines = orderItems.map((it) => orderItemToCartLine(it, menuItems));
  const serverByOrderItemId = new Map(serverLines.map((l) => [l.orderItemId!, l]));

  const kitchenFromPrev = prev.filter((l) => l.status === 'in_kitchen' && l.orderItemId);
  const mergedKitchen: CartLine[] = [];
  const seenOrderItemIds = new Set<string>();

  for (const line of kitchenFromPrev) {
    const fresh = serverByOrderItemId.get(line.orderItemId!);
    if (!fresh) continue;
    seenOrderItemIds.add(line.orderItemId!);
    mergedKitchen.push({
      ...line,
      quantity: fresh.quantity,
      totalPrice: fresh.totalPrice,
      kitchenStatus: fresh.kitchenStatus,
      variantName: fresh.variantName,
      addonNames: fresh.addonNames,
    });
  }

  const newKitchenLines = serverLines.filter((l) => {
    if (l.orderItemId && seenOrderItemIds.has(l.orderItemId)) return false;
    if (inCartSigs.has(cartLineSignature(l))) return false;
    return true;
  });

  return [...inCart, ...mergedKitchen, ...newKitchenLines];
}

function newCartLineId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `line-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Same menu line identity — avoids duplicate kitchen rows after recall + refresh */
function cartLineSignature(line: {
  item: { id: string };
  variantName?: string;
  addonNames?: string[];
}) {
  return `${line.item.id}|${line.variantName ?? ''}|${JSON.stringify(line.addonNames ?? [])}`;
}

function orderItemToCartLine(orderItem: any, menuItems: MenuItem[]): CartLine {
  const menu = menuItems.find((m) => m.id === orderItem.itemId) || orderItem.item;
  return {
    lineId: orderItem.id,
    orderItemId: orderItem.id,
    item: {
      id: menu?.id || orderItem.itemId,
      name: menu?.name || orderItem.item?.name || 'Item',
      price: menu?.price ?? orderItem.price,
      image: menu?.image || orderItem.item?.image,
      categoryId: menu?.categoryId || '',
      variants: menu?.variants,
      addons: menu?.addons,
    },
    quantity: orderItem.quantity,
    variantName: orderItem.variantName,
    addonNames: orderItem.addonNames || [],
    totalPrice: orderItem.price,
    status: 'in_kitchen',
    kitchenStatus: (orderItem.status as KitchenItemStatus) || 'PENDING',
  };
}

interface ActiveKitchenOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  tableId?: string | null;
  table?: { id?: string; name?: string } | null;
}

const getOrderPaidAmount = (order: any): number =>
  (order?.payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

function filterUnpaidOrders(orders: any[]): any[] {
  return (orders || []).filter((o: any) => {
    if (o.status === 'CANCELLED') return false;
    return getOrderPaidAmount(o) < (o.totalAmount || 0);
  });
}

function pickPosOrder(
  unpaid: any[],
  opts: { activeId?: string | null; tableId?: string | null },
): any | null {
  if (opts.activeId) {
    const byActive = unpaid.find((o) => o.id === opts.activeId);
    if (byActive) return byActive;
  }
  if (opts.tableId) {
    const byTable = unpaid.find((o) => (o.tableId || o.table?.id) === opts.tableId);
    if (byTable) return byTable;
  }
  return unpaid[0] ?? null;
}

function orderToActiveKitchen(order: any): ActiveKitchenOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    type: order.type,
    tableId: order.tableId || order.table?.id || null,
    table: order.table,
  };
}

function orderKitchenProgress(order: { items?: Array<{ status?: string }> }) {
  const orderItems = order.items || [];
  const total = orderItems.length;
  const done = orderItems.filter((i) => i.status === 'COMPLETED').length;
  return { total, done, allDone: total > 0 && done === total };
}

function orderLocationLabel(order: {
  type?: string;
  table?: { name?: string } | null;
}): string {
  if (order.type === 'DINE_IN' && order.table?.name) return order.table.name;
  if (order.type === 'DELIVERY') return 'Delivery';
  if (order.type === 'TAKEAWAY') return 'Takeaway';
  return 'Order';
}

interface MenuItemCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

const ImageFallback = memo(function ImageFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
      <ShoppingCart className="h-10 w-10 opacity-20" />
    </div>
  );
});

const MenuItemCard = memo(function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  return (
    <Card 
      className="hover-scale group cursor-pointer border-slate-100/50 bg-white premium-shadow overflow-hidden"
      onClick={() => onClick(item)}
    >
      <div className="h-24 sm:h-40 relative overflow-hidden bg-slate-100">
        <OptimizedImage
          src={item.image || ''}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          fallback={<ImageFallback />}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 sm:p-4">
          <span className="text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider">Add to order</span>
        </div>
      </div>
      <CardContent className="p-2 sm:p-4 flex flex-col justify-between">
        <h3 className="font-bold text-slate-800 leading-snug mb-1 sm:mb-2 line-clamp-2 text-xs sm:text-sm h-8 sm:h-10">{item.name}</h3>
        <div className="flex items-center justify-between">
          <span className="hidden sm:inline text-[10px] font-black text-slate-400 uppercase tracking-tighter">Variant</span>
          <span className="font-extrabold text-primary text-sm sm:text-base">Rs. {item.price > 0 ? item.price : item.variants?.[0]?.price}</span>
        </div>
      </CardContent>
    </Card>
  );
});

interface CartItemRowProps {
  cartItem: CartLine;
  onUpdateQuantity: (lineId: string, delta: number) => void;
  onRemove: (lineId: string) => void;
  onSendToKitchen?: (lineId: string) => void;
  onRecallFromKitchen?: (lineId: string) => void;
  sending?: boolean;
  readOnly?: boolean;
}

const CartImageFallback = memo(function CartImageFallback() {
  return <ShoppingCart className="h-4 w-4 opacity-10" />;
});

const CartItemRow = memo(function CartItemRow({
  cartItem,
  onUpdateQuantity,
  onRemove,
  onSendToKitchen,
  onRecallFromKitchen,
  sending,
  readOnly,
}: CartItemRowProps) {
  const { lineId, item, quantity, variantName, totalPrice, status, addonNames, kitchenStatus } =
    cartItem;
  const inKitchen = status === 'in_kitchen';
  const kitchenDone = inKitchen && kitchenStatus === 'COMPLETED';

  return (
    <div
      className={`flex gap-4 p-3 rounded-2xl border transition-colors group ${
        kitchenDone
          ? 'border-emerald-200 bg-emerald-50/50'
          : inKitchen
            ? 'border-amber-200 bg-amber-50/40'
            : 'border-slate-50 hover:bg-slate-50/50'
      }`}
    >
      <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100 bg-slate-50 flex items-center justify-center relative">
        {item.image ? (
          <OptimizedImage 
            src={item.image} 
            alt={item.name} 
            fill 
            sizes="56px" 
            className="object-cover"
            fallback={<CartImageFallback />}
          />
        ) : (
          <CartImageFallback />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div className="truncate pr-2">
            <div className="font-bold text-slate-800 text-sm truncate">{item.name}</div>
            {variantName && <div className="text-[10px] text-indigo-600 font-bold">{variantName}</div>}
            {addonNames?.map((a) => (
              <div key={a} className="text-[10px] text-emerald-600 font-semibold">
                + {a}
              </div>
            ))}
            {inKitchen ? (
              <div
                className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${
                  kitchenDone
                    ? 'text-emerald-700'
                    : kitchenStatus === 'PREPARING'
                      ? 'text-blue-700'
                      : 'text-amber-700'
                }`}
              >
                {kitchenDone ? 'Kitchen done — ready' : `Kitchen: ${kitchenStatusLabel(kitchenStatus)}`}
              </div>
            ) : (
              <div className="text-[9px] font-black uppercase tracking-wider text-emerald-700 mt-0.5">
                In basket — tap Kitchen to send
              </div>
            )}
          </div>
          <span className="font-black text-slate-900 text-sm">Rs. {(totalPrice * quantity).toFixed(0)}</span>
        </div>
        <div className="flex items-center justify-between mt-2 gap-2">
          {!inKitchen ? (
            <div className="flex items-center gap-1 bg-white border border-slate-100 shadow-sm rounded-full p-0.5">
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-100 text-slate-600" onClick={() => onUpdateQuantity(lineId, -1)}><Minus className="h-3 w-3" /></Button>
              <span className="w-5 text-center text-xs font-bold text-slate-800">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-100 text-slate-600" onClick={() => onUpdateQuantity(lineId, 1)}><Plus className="h-3 w-3" /></Button>
            </div>
          ) : (
            <span className="text-xs font-bold text-amber-800">Qty {quantity}</span>
          )}
          <div className="flex items-center gap-1">
            {!inKitchen && onSendToKitchen && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] font-black uppercase tracking-wide text-amber-700 hover:bg-amber-100"
                disabled={sending}
                onClick={() => onSendToKitchen(lineId)}
              >
                {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChefHat className="h-3.5 w-3.5 sm:mr-1" />}
                <span className="hidden sm:inline">Kitchen</span>
              </Button>
            )}
            {inKitchen && !kitchenDone && onRecallFromKitchen && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] font-black uppercase tracking-wide text-indigo-700 hover:bg-indigo-50"
                disabled={sending}
                onClick={(e) => {
                  e.stopPropagation();
                  onRecallFromKitchen(lineId);
                }}
              >
                {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3.5 w-3.5 sm:mr-1" />}
                <span className="hidden sm:inline">Back to basket</span>
              </Button>
            )}
            {kitchenDone && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 px-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ready</span>
              </span>
            )}
            {!readOnly && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-full" onClick={() => onRemove(lineId)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function POSPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [orderType, setOrderType] = useState<any>('DINE_IN');
  const [loading, setLoading] = useState(true);
  const [posUser, setPosUser] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [sendingLineId, setSendingLineId] = useState<string | null>(null);

  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [kitchenTicket, setKitchenTicket] = useState<any>(null);
  const [activeKitchenOrder, setActiveKitchenOrder] = useState<ActiveKitchenOrder | null>(null);
  const [checkoutAutoOpened, setCheckoutAutoOpened] = useState(false);

  const [tables, setTables] = useState<any[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>(EMPTY_DELIVERY);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'FULL' | 'SPLIT' | 'PARTIAL'>('FULL');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [fullPaymentMethod, setFullPaymentMethod] = useState<PaymentMethod>('CASH');
  const [splitPaymentMethod, setSplitPaymentMethod] = useState<PaymentMethod>('CARD');
  const [partialPaymentMethod, setPartialPaymentMethod] = useState<PaymentMethod>('CASH');
  const [splitCount, setSplitCount] = useState<number>(2);
  const [partialPayments, setPartialPayments] = useState<{amount: number, method: PaymentMethod}[]>([]);


  // Variant Selection State
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  // Mobile cart state
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  /** Portals must mount on the client so #print-receipt is a direct child of document.body for print CSS. */
  const [printPortalReady, setPrintPortalReady] = useState(false);
  const [openUnpaidOrders, setOpenUnpaidOrders] = useState<any[]>([]);

  /** Blocks 5s poll from re-adding kitchen rows while send/recall is in flight */
  const cartSyncPausedRef = useRef(0);
  const activeKitchenOrderRef = useRef<ActiveKitchenOrder | null>(null);
  const selectedTableIdRef = useRef('');
  const fetchDataRef = useRef<() => Promise<void>>(async () => {});

  activeKitchenOrderRef.current = activeKitchenOrder;
  selectedTableIdRef.current = selectedTableId;

  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  const orderRef = useMemo(() => Math.floor(1000 + Math.random() * 9000), []);

  const modalAddonOptions = useMemo(() => {
    if (!selectedItemForModal?.addons?.length) return [];
    const all = selectedItemForModal.addons;
    const toppings = all.filter((a) => a.name.startsWith('Extra Topping'));
    if (!toppings.length) return all;
    if (!selectedVariant) return toppings;
    const forSize = toppings.filter((a) => a.name.includes(`(${selectedVariant})`));
    return forSize.length ? forSize : toppings;
  }, [selectedItemForModal, selectedVariant]);

  const fetchData = useCallback(async () => {
    try {
      const [catsRes, itemsRes, branchesRes, tablesRes, ordersRes] = await Promise.all([
        apiClient.get('/menu/categories'),
        apiClient.get('/menu/items'),
        apiClient.get('/branches'),
        apiClient.get('/tables'),
        apiClient.get('/orders'),
      ]);
      const cats = catsRes.data || [];
      const categoryNameById = Object.fromEntries(cats.map((c: { id: string; name: string }) => [c.id, c.name]));
      setCategories(cats);
      setItems(
        (itemsRes.data || []).map((item: MenuItem) => ({
          ...item,
          image:
            item.image?.trim() ||
            imageForCategory(categoryNameById[item.categoryId]),
        })),
      );
      setBranches(branchesRes.data);
      setTables(tablesRes.data);

      // Recover unpaid kitchen order (by active id or selected table) for manager checkout.
      const unpaidOrders = filterUnpaidOrders(ordersRes.data);
      setOpenUnpaidOrders(unpaidOrders);
      const latest = pickPosOrder(unpaidOrders, {
        activeId: activeKitchenOrderRef.current?.id,
        tableId: selectedTableIdRef.current || null,
      });

      if (latest) {
        const next = orderToActiveKitchen(latest);
        setActiveKitchenOrder((prev) => {
          if (
            prev &&
            prev.id === next.id &&
            prev.status === next.status &&
            prev.totalAmount === next.totalAmount
          ) {
            return prev;
          }
          return next;
        });
        if (latest.type === 'DINE_IN' && (latest.tableId || latest.table?.id)) {
          setSelectedTableId(latest.tableId || latest.table.id);
        }
        if (cartSyncPausedRef.current === 0) {
          setCartLines((prev) => mergeCartWithOrder(prev, latest.items || [], itemsRes.data));
        }
      } else if (cartSyncPausedRef.current === 0) {
        setActiveKitchenOrder(null);
        setCartLines((prev) => prev.filter((l) => l.status === 'in_cart'));
      }
    } catch (error) {

      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  fetchDataRef.current = fetchData;

  useEffect(() => {
    setPosUser(
      typeof window !== 'undefined'
        ? localStorage.getItem('userName') || localStorage.getItem('userRole') || 'Staff'
        : 'Staff',
    );
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPrintPortalReady(true);
  }, []);

  useEffect(() => {
    if (orderType !== 'DELIVERY') {
      setDeliveryDetails(EMPTY_DELIVERY);
    }
  }, [orderType]);

  useEffect(() => {
    if (orderSuccess) {
      const printTimer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(printTimer);
    }
  }, [orderSuccess]);

  useEffect(() => {
    if (!kitchenTicket) return;
    const printTimer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(printTimer);
  }, [kitchenTicket]);

  useEffect(() => {
    if (!activeKitchenOrder) return;

    const poll = async () => {
      try {
        const res = await apiClient.get('/orders');
        const fresh = res.data.find((o: any) => o.id === activeKitchenOrder.id);
        if (fresh) {
          setActiveKitchenOrder(orderToActiveKitchen(fresh));
          if (cartSyncPausedRef.current === 0 && fresh.items?.length) {
            setCartLines((prev) => mergeCartWithOrder(prev, fresh.items, items));
          }
        }
      } catch (error) {
        console.error('Failed to poll kitchen order status:', error);
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [activeKitchenOrder?.id, items]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDataRef.current();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // When manager picks a table, load that table's open order (kitchen + checkout state).
  useEffect(() => {
    if (orderType !== 'DINE_IN' || !selectedTableId) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await apiClient.get('/orders');
        if (cancelled) return;

        const tableOrder = filterUnpaidOrders(res.data).find(
          (o) => (o.tableId || o.table?.id) === selectedTableId,
        );

        if (tableOrder) {
          setActiveKitchenOrder(orderToActiveKitchen(tableOrder));
          if (cartSyncPausedRef.current === 0) {
            setCartLines((prev) =>
              mergeCartWithOrder(prev, tableOrder.items || [], items),
            );
          }
        } else {
          const current = activeKitchenOrderRef.current;
          const currentTableId = current?.tableId || current?.table?.id;
          if (!current || currentTableId !== selectedTableId) {
            setActiveKitchenOrder(null);
            setCheckoutAutoOpened(false);
            if (cartSyncPausedRef.current === 0) {
              setCartLines((prev) => prev.filter((l) => l.status === 'in_cart'));
            }
          }
        }
      } catch (error) {
        console.error('Failed to load table order:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedTableId, orderType, items]);

  const addToCart = useCallback((item: MenuItem, variantName?: string, addonNames?: string[]) => {
    let finalPrice = item.price;
    if (variantName && item.variants) {
      const v = item.variants.find(v => v.name === variantName);
      if (v) finalPrice = v.price;
    }
    if (addonNames && item.addons) {
      const extras = item.addons.filter(a => addonNames.includes(a.name));
      finalPrice += extras.reduce((sum, a) => sum + a.price, 0);
    }

    setCartLines((prev) => [
      ...prev,
      {
        lineId: newCartLineId(),
        item,
        quantity: 1,
        variantName,
        addonNames,
        totalPrice: finalPrice,
        status: 'in_cart',
      },
    ]);
    
    setSelectedItemForModal(null);
  }, []);

  const onItemClick = useCallback((item: MenuItem) => {
    if (item.variants && item.variants.length > 0) {
      setSelectedItemForModal(item);
      setSelectedVariant(item.variants[0].name);
      setSelectedAddons([]);
    } else {
      addToCart(item);
    }
  }, [addToCart]);

  const lineToPayload = (line: CartLine) => ({
    itemId: line.item.id,
    quantity: line.quantity,
    variantName: line.variantName,
    addonNames: line.addonNames,
  });

  const syncActiveOrder = (order: any) => {
    if (!order) {
      setActiveKitchenOrder(null);
      return;
    }
    setActiveKitchenOrder({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      type: order.type,
      table: order.table,
    });
  };

  const printKitchenSlip = useCallback(
    (
      orderNumber: string,
      items: CartLine[],
      type: string,
      tableName: string,
      delivery: DeliveryDetails | null,
      isAddition = false,
    ) => {
      setKitchenTicket({
        orderNumber,
        orderType: type,
        tableName,
        cart: [...items],
        timestamp: new Date(),
        isAddition,
        delivery,
      });
    },
    [],
  );

  const sendLineToKitchen = async (lineId: string) => {
    const line = cartLines.find((l) => l.lineId === lineId && l.status === 'in_cart');
    if (!line || branches.length === 0) return;

    if (!activeKitchenOrder) {
      if (orderType === 'DINE_IN' && !selectedTableId) {
        alert('Please select a table first.');
        return;
      }
      if (orderType === 'DELIVERY' && !isDeliveryDetailsValid(deliveryDetails)) {
        alert('Please enter rider name, customer cell number, and delivery address.');
        return;
      }
    }

    setSendingLineId(lineId);
    cartSyncPausedRef.current += 1;
    try {
      let order: any;
      if (activeKitchenOrder) {
        const updated = await apiClient.patch(`/orders/${activeKitchenOrder.id}/items`, {
          items: [lineToPayload(line)],
        });
        order = updated.data;
      } else {
        const created = await apiClient.post('/orders', {
          type: orderType,
          branchId: branches[0].id,
          tableId: orderType === 'DINE_IN' && selectedTableId ? selectedTableId : undefined,
          items: [lineToPayload(line)],
          ...(orderType === 'DELIVERY'
            ? {
                deliveryRiderName: deliveryDetails.riderName.trim(),
                deliveryPhone: deliveryDetails.phone.trim(),
                deliveryAddress: deliveryDetails.address.trim(),
              }
            : {}),
        });
        order = created.data;
        setCheckoutAutoOpened(false);
      }

      syncActiveOrder(order);
      if (order.status !== 'COMPLETED') {
        setCheckoutAutoOpened(false);
        setIsPaymentModalOpen(false);
      }

      const savedItem = order.items[order.items.length - 1];
      setCartLines((prev) =>
        prev.map((l) =>
          l.lineId === lineId
            ? {
                ...l,
                status: 'in_kitchen' as const,
                orderItemId: savedItem?.id,
                kitchenStatus: 'PENDING' as const,
              }
            : l,
        ),
      );

      printKitchenSlip(
        order.orderNumber,
        [line],
        order.type,
        order.type === 'DINE_IN'
          ? order.table?.name || tables.find((t) => t.id === selectedTableId)?.name || 'N/A'
          : 'N/A',
        order.type === 'DELIVERY'
          ? {
              riderName: order.deliveryRiderName || deliveryDetails.riderName,
              phone: order.deliveryPhone || deliveryDetails.phone,
              address: order.deliveryAddress || deliveryDetails.address,
            }
          : null,
        !!activeKitchenOrder,
      );
    } catch (error) {
      console.error('Kitchen send failed:', error);
      alert('Failed to send this item to kitchen.');
    } finally {
      cartSyncPausedRef.current = Math.max(0, cartSyncPausedRef.current - 1);
      setSendingLineId(null);
    }
  };

  const recallLineFromKitchen = useCallback(
    async (lineId: string) => {
      const line = cartLines.find(
        (l) =>
          l.status === 'in_kitchen' &&
          (l.lineId === lineId || l.orderItemId === lineId),
      );

      if (!line) {
        alert('Item not found in kitchen queue.');
        return;
      }
      if (!activeKitchenOrder) {
        alert('No active kitchen order.');
        return;
      }

      const orderItemId = line.orderItemId;
      if (!orderItemId) {
        alert('This item is not linked to the order yet.');
        return;
      }

      const stableLineId = line.lineId;
      const snapshot = { ...line };

      setIsPaymentModalOpen(false);
      setCheckoutAutoOpened(true);
      setSendingLineId(stableLineId);
      cartSyncPausedRef.current += 1;

      // Move to basket immediately so the row leaves "With kitchen"
      setCartLines((prev) => {
        const sig = cartLineSignature(line);
        const withoutDupes = prev.filter(
          (l) =>
            !(
              l.status === 'in_kitchen' &&
              l.lineId !== stableLineId &&
              cartLineSignature(l) === sig
            ),
        );
        return withoutDupes.map((l) =>
          l.lineId === stableLineId
            ? { ...l, status: 'in_cart' as const, orderItemId: undefined }
            : l,
        );
      });

      try {
        const res = await apiClient.delete(
          `/orders/${activeKitchenOrder.id}/items/${orderItemId}`,
        );

        if (res.data === null) {
          setActiveKitchenOrder(null);
          setCheckoutAutoOpened(false);
        } else if (res.data) {
          syncActiveOrder(res.data);
        }
      } catch (error: any) {
        console.error('Recall from kitchen failed:', error);
        setCartLines((prev) => {
          const back = prev.filter((l) => l.lineId !== stableLineId);
          return [...back, { ...snapshot, status: 'in_kitchen' as const, orderItemId }];
        });
        alert(error?.response?.data?.message || 'Could not move this item back to the cart.');
      } finally {
        cartSyncPausedRef.current = Math.max(0, cartSyncPausedRef.current - 1);
        setSendingLineId(null);
      }
    },
    [cartLines, activeKitchenOrder],
  );

  const finalizeOrder = async (paymentsArray: {amount: number, method: PaymentMethod}[]) => {
    if (!activeKitchenOrder) return;

    setProcessingOrder(true);
    try {
      const paid = await apiClient.patch(`/orders/${activeKitchenOrder.id}/checkout`, {
        payments: paymentsArray,
      });

      const orderSnapshot = {
        cart: (paid.data.items || []).map((it: any) => ({
          item: {
            id: it.item?.id,
            name: it.item?.name || 'Item',
            image: it.item?.image,
          },
          quantity: it.quantity,
          variantName: it.variantName,
          addonNames: it.addonNames || [],
          totalPrice: it.price,
        })),
        subtotal: paid.data.totalAmount,
        orderType: paid.data.type,
        payments: paid.data.payments || paymentsArray,
        cashier: posUser || 'Staff',
        timestamp: new Date(),
        delivery:
          paid.data.type === 'DELIVERY'
            ? {
                riderName: paid.data.deliveryRiderName || '',
                phone: paid.data.deliveryPhone || '',
                address: paid.data.deliveryAddress || '',
              }
            : null,
      };

      setOrderSuccess(orderSnapshot);
      setActiveKitchenOrder(null);
      setCartLines([]);
      setCheckoutAutoOpened(false);
      setIsPaymentModalOpen(false);
      setAmountTendered('');
      setPartialPayments([]);

      const tablesRes = await apiClient.get('/tables');
      setTables(tablesRes.data);
    } catch (error: any) {
      console.error('Checkout failed:', error);
      alert(error?.response?.data?.message || 'Checkout failed.');
    } finally {
      setProcessingOrder(false);
    }
  };

  const updateQuantity = useCallback((lineId: string, delta: number) => {
    setCartLines((prev) =>
      prev.map((p) => {
        if (p.lineId !== lineId || p.status !== 'in_cart') return p;
        const newQ = p.quantity + delta;
        return newQ > 0 ? { ...p, quantity: newQ } : p;
      }),
    );
  }, []);

  const linesInCart = useMemo(
    () => cartLines.filter((l) => l.status === 'in_cart'),
    [cartLines],
  );
  const linesInKitchen = useMemo(
    () => cartLines.filter((l) => l.status === 'in_kitchen'),
    [cartLines],
  );
  const linesKitchenActive = useMemo(
    () => linesInKitchen.filter((l) => l.kitchenStatus !== 'COMPLETED'),
    [linesInKitchen],
  );
  const linesKitchenDone = useMemo(
    () => linesInKitchen.filter((l) => l.kitchenStatus === 'COMPLETED'),
    [linesInKitchen],
  );
  const kitchenDoneCount = linesKitchenDone.length;
  const kitchenTotalCount = linesInKitchen.length;
  const allKitchenItemsDone =
    kitchenTotalCount > 0 && kitchenDoneCount === kitchenTotalCount;
  const readyForCheckout = Boolean(
    activeKitchenOrder && allKitchenItemsDone && linesInCart.length === 0,
  );

  const ordersNeedingManager = useMemo(
    () =>
      openUnpaidOrders.filter((o) => {
        const { done, allDone } = orderKitchenProgress(o);
        return done > 0 || allDone || o.status === 'COMPLETED';
      }),
    [openUnpaidOrders],
  );

  const loadOrderIntoPos = useCallback(
    (order: any, openCheckout = false) => {
      setActiveKitchenOrder(orderToActiveKitchen(order));
      if (order.type === 'DINE_IN' && (order.tableId || order.table?.id)) {
        setSelectedTableId(order.tableId || order.table.id);
        setOrderType('DINE_IN');
      } else if (order.type === 'DELIVERY') {
        setOrderType('DELIVERY');
      } else if (order.type === 'TAKEAWAY') {
        setOrderType('TAKEAWAY');
      }
      setCartLines(mergeCartWithOrder([], order.items || [], items));
      setMobileCartOpen(true);
      if (openCheckout) {
        setPaymentMode('FULL');
        setAmountTendered('');
        setCheckoutAutoOpened(true);
        setIsPaymentModalOpen(true);
      }
    },
    [items],
  );

  useEffect(() => {
    if (!readyForCheckout) return;
    if (checkoutAutoOpened) return;
    setCheckoutAutoOpened(true);
    setPaymentMode('FULL');
    setAmountTendered('');
    setIsPaymentModalOpen(true);
  }, [readyForCheckout, checkoutAutoOpened]);

  const subtotal = useMemo(
    () => cartLines.reduce((sum, p) => sum + p.totalPrice * p.quantity, 0),
    [cartLines],
  );
  const payableTotal = activeKitchenOrder?.totalAmount ?? subtotal;

  const availableTables = useMemo(() => {
    const tableNumber = (name: string) => {
      const match = name?.match(/(\d+)\s*$/);
      return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
    };

    return tables
      .slice()
      .sort((a, b) => {
        const diff = tableNumber(a.name) - tableNumber(b.name);
        if (diff !== 0) return diff;
        return String(a.name).localeCompare(String(b.name));
      });
  }, [tables]);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (activeCategory === 'All' || item.categoryId === activeCategory) &&
          item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
      ),
    [items, activeCategory, debouncedSearchQuery],
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      const line = cartLines.find((l) => l.lineId === lineId);
      if (!line) return;
      if (line.status === 'in_kitchen' && line.orderItemId && activeKitchenOrder) {
        setSendingLineId(lineId);
        try {
          const res = await apiClient.delete(
            `/orders/${activeKitchenOrder.id}/items/${line.orderItemId}`,
          );
          if (res.data) syncActiveOrder(res.data);
          else {
            setActiveKitchenOrder(null);
            setCheckoutAutoOpened(false);
          }
          setCartLines((prev) => prev.filter((l) => l.lineId !== lineId));
        } catch (error) {
          console.error('Remove kitchen item failed:', error);
          alert('Could not remove this item.');
        } finally {
          setSendingLineId(null);
        }
        return;
      }
      setCartLines((prev) => prev.filter((l) => l.lineId !== lineId));
    },
    [cartLines, activeKitchenOrder],
  );

  const renderCartSections = (compact?: boolean) => (
    <>
      {linesInCart.length > 0 && (
        <div
          className={`${compact ? 'space-y-2' : 'space-y-3'} rounded-xl border-2 border-emerald-200/80 bg-emerald-50/30 p-2`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 px-1">
            In basket ({linesInCart.length})
          </p>
          {linesInCart.map((p) => (
            <CartItemRow
              key={p.lineId}
              cartItem={p}
              onUpdateQuantity={updateQuantity}
              onRemove={removeLine}
              onSendToKitchen={sendLineToKitchen}
              sending={sendingLineId === p.lineId}
            />
          ))}
        </div>
      )}
      {linesKitchenActive.length > 0 && (
        <div
          className={`${compact ? 'space-y-2 mt-4' : 'space-y-3 mt-4'} rounded-xl border-2 border-amber-200/80 bg-amber-50/40 p-2`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 px-1">
            With kitchen ({linesKitchenActive.length})
          </p>
          {linesKitchenActive.map((p) => (
            <CartItemRow
              key={p.lineId}
              cartItem={p}
              onUpdateQuantity={updateQuantity}
              onRemove={removeLine}
              onRecallFromKitchen={recallLineFromKitchen}
              sending={sendingLineId === p.lineId}
            />
          ))}
        </div>
      )}
      {linesKitchenDone.length > 0 && (
        <div
          className={`${compact ? 'space-y-2 mt-4' : 'space-y-3 mt-4'} rounded-xl border-2 border-emerald-300/80 bg-emerald-50/60 p-2`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 px-1">
            Kitchen done — ready ({linesKitchenDone.length})
          </p>
          {linesKitchenDone.map((p) => (
            <CartItemRow
              key={p.lineId}
              cartItem={p}
              onUpdateQuantity={updateQuantity}
              onRemove={removeLine}
              readOnly
            />
          ))}
        </div>
      )}
    </>
  );

  const renderTableSelect = (className?: string) => (
    <div className={className}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
        <MapPin className="h-3 w-3 text-indigo-600" />
        Select table (required for dine-in)
      </label>
      <select
        className={`flex h-10 w-full items-center rounded-lg border bg-white px-3 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          selectedTableId ? 'border-indigo-300' : 'border-amber-400 ring-1 ring-amber-200'
        }`}
        value={selectedTableId}
        onChange={(e) => setSelectedTableId(e.target.value)}
      >
        <option value="">Choose a table…</option>
        {availableTables.map((t) => {
          const isAvailable = t.status === 'AVAILABLE';
          const isCurrent = t.id === selectedTableId;
          const canPick = isAvailable || (!!activeKitchenOrder && isCurrent);
          return (
            <option key={t.id} value={t.id} disabled={!canPick}>
              {t.name} ({t.capacity} seats)
              {isAvailable ? '' : isCurrent ? ' — your table' : ' — in use'}
            </option>
          );
        })}
      </select>
      {!selectedTableId && (
        <p className="text-[10px] text-amber-700 font-bold mt-1">Pick a table before sending items to kitchen.</p>
      )}
    </div>
  );

  const renderCartFooter = () => (
    <div className="shrink-0 border-t border-slate-100 bg-slate-50/95 backdrop-blur-sm">
      <div className="max-h-[min(48vh,22rem)] overflow-y-auto overscroll-contain custom-scrollbar p-3 sm:p-4 space-y-3">
        {orderType === 'DINE_IN' && renderTableSelect()}

        {orderType === 'DELIVERY' && (
          <DeliveryDetailsFields
            variant="compact"
            value={deliveryDetails}
            onChange={setDeliveryDetails}
          />
        )}

        <div className="flex justify-between items-center text-lg sm:text-xl font-black text-slate-900 pt-1">
          <span className="tracking-tighter">Total</span>
          <span className="text-primary truncate ml-2">
            Rs. {(activeKitchenOrder?.totalAmount ?? subtotal).toFixed(0)}
          </span>
        </div>

        {activeKitchenOrder && (
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs space-y-2">
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500">Open order</p>
              <p className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
                #{activeKitchenOrder.orderNumber}
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {readyForCheckout
                  ? 'All dishes done — complete order & take payment'
                  : kitchenTotalCount > 0
                    ? `Kitchen progress: ${kitchenDoneCount} of ${kitchenTotalCount} dishes ready`
                    : `Kitchen: ${activeKitchenOrder.status}`}
              </p>
            </div>
            {linesKitchenDone.length > 0 && (
              <ul className="space-y-1 rounded-lg bg-emerald-50 border border-emerald-100 p-2">
                {linesKitchenDone.map((line) => (
                  <li key={line.lineId} className="flex items-center gap-2 text-[11px] font-semibold text-emerald-900">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate">
                      {line.item.name}
                      {line.variantName ? ` (${line.variantName})` : ''} × {line.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {!readyForCheckout && (
              <p className="text-[10px] text-slate-400">
                Mark each dish done on Kitchen screen — checkout unlocks when all are ready
              </p>
            )}
          </div>
        )}
      </div>

      {activeKitchenOrder && (
        <div className="p-3 sm:p-4 pt-0 border-t border-slate-100/80 bg-slate-50/95 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            className={`h-12 sm:h-14 w-full font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg border-none rounded-xl ${
              readyForCheckout
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/50'
                : 'premium-gradient opacity-90'
            }`}
            disabled={processingOrder || !readyForCheckout}
            onClick={() => {
              setMobileCartOpen(false);
              setPaymentMode('FULL');
              setAmountTendered('');
              setCheckoutAutoOpened(true);
              setIsPaymentModalOpen(true);
            }}
          >
            {readyForCheckout
              ? 'Complete order & take payment'
              : `Awaiting kitchen (${kitchenDoneCount}/${kitchenTotalCount || '…'} done)`}
          </Button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Initializing Terminal...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden bg-background">
      {/* Items Section */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-50/30">
        <div className="bg-white/80 backdrop-blur-md p-2 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 sticky top-0 z-10 shrink-0">
          <div className="flex bg-slate-100/80 p-0.5 sm:p-1 rounded-full border border-slate-200/50 overflow-x-auto no-scrollbar">
             {['DINE_IN', 'TAKEAWAY', 'DELIVERY'].map(t => (
               <Button 
                 key={t}
                 variant={orderType === t ? 'default' : 'ghost'} 
                 size="sm" 
                 onClick={() => setOrderType(t)} 
                 className={`rounded-full px-3 sm:px-6 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${orderType === t ? 'premium-gradient shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 {t === 'DINE_IN' ? 'Dine In' : t === 'TAKEAWAY' ? 'Take' : 'Delivery'}
               </Button>
             ))}
          </div>

          <div className="relative flex-1 sm:max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-9 bg-slate-50 border-slate-200 h-9 sm:h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {orderType === 'DINE_IN' && (
          <div className="px-2 sm:px-4 py-2 sm:py-3 border-b border-indigo-100 bg-indigo-50/80 shrink-0">
            {renderTableSelect('max-w-xl')}
          </div>
        )}

        {ordersNeedingManager.length > 0 && (
          <div className="px-2 sm:px-4 py-2 sm:py-3 border-b border-emerald-200 bg-emerald-50 shrink-0 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
              <ChefHat className="h-3.5 w-3.5" />
              Kitchen → POS — manager checkout
            </p>
            <div className="flex flex-col gap-2">
              {ordersNeedingManager.map((order) => {
                const { total, done, allDone } = orderKitchenProgress(order);
                const isReady =
                  allDone || order.status === 'COMPLETED';
                const isActive = activeKitchenOrder?.id === order.id;
                const doneItems = (order.items || []).filter(
                  (i: { status?: string }) => i.status === 'COMPLETED',
                );

                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center gap-3 ${
                      isActive
                        ? 'border-emerald-500 bg-white ring-2 ring-emerald-200'
                        : 'border-emerald-200 bg-white/80'
                    }`}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-900">#{order.orderNumber}</span>
                        <span className="text-xs font-bold text-slate-500">
                          {orderLocationLabel(order)}
                        </span>
                        {isReady ? (
                          <span className="text-[10px] font-black uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            All dishes ready
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wide text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            {done} of {total} dishes done
                          </span>
                        )}
                      </div>
                      {doneItems.length > 0 && (
                        <ul className="text-[11px] text-emerald-900 font-medium space-y-0.5">
                          {doneItems.map((it: any) => (
                            <li key={it.id} className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                              <span className="truncate">
                                {it.quantity}× {it.item?.name || 'Item'}
                                {it.variantName ? ` (${it.variantName})` : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className={`shrink-0 font-black text-xs uppercase tracking-wide ${
                        isReady
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : ''
                      }`}
                      variant={isReady ? 'default' : 'outline'}
                      onClick={() => loadOrderIntoPos(order, isReady)}
                    >
                      {isReady ? 'Complete order & pay' : 'Open in basket'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {orderType === 'DELIVERY' && (
          <div className="px-2 sm:px-4 py-2 sm:py-3 border-b border-indigo-100 bg-indigo-50/60 shrink-0 lg:hidden">
            <DeliveryDetailsFields
              variant="compact"
              value={deliveryDetails}
              onChange={setDeliveryDetails}
            />
          </div>
        )}
        
        <div className="p-2 sm:p-4 overflow-x-auto shrink-0 border-b bg-white no-scrollbar">
          <div className="flex gap-1.5 sm:gap-2">
            <Button 
                variant={activeCategory === 'All' ? 'default' : 'outline'}
                size="sm"
                className={`whitespace-nowrap rounded-full font-medium text-xs sm:text-sm ${activeCategory === 'All' ? 'bg-indigo-600' : 'text-slate-600 border-slate-200'}`}
                onClick={() => setActiveCategory('All')}
            >
                All
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                className={`whitespace-nowrap rounded-full font-medium text-xs sm:text-sm ${activeCategory === cat.id ? 'bg-indigo-600' : 'text-slate-600 border-slate-200'}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 p-3 sm:p-6 overflow-y-auto custom-scrollbar pb-28 lg:pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
            {filteredItems.map(item => (
              <MenuItemCard key={item.id} item={item} onClick={onItemClick} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Cart Sidebar */}
      <div className="hidden lg:flex w-[min(100%,360px)] xl:w-[380px] h-full min-h-0 bg-white border-l shadow-xl flex-col shrink-0 relative">
        {orderSuccess && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
             <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 scale-up">
                <CheckCircle2 className="h-10 w-10" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Order Confirmed!</h2>
             <p className="text-slate-500 text-sm">Printing ticket for Kitchen Display System...</p>
          </div>
        )}

        <div className="p-4 xl:p-5 premium-gradient flex items-center gap-3 shadow-lg shrink-0">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg leading-none">Order Basket</h2>
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Ref: #POS-{orderRef}</p>
          </div>
          <span className="ml-auto bg-white text-primary px-3 py-1 rounded-full text-xs font-black shadow-sm">
            {linesInCart.length + linesInKitchen.length}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3 xl:p-4 space-y-4 custom-scrollbar">
          {activeKitchenOrder && linesKitchenDone.length > 0 && !readyForCheckout && (
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 text-xs">
              <p className="font-black uppercase tracking-widest text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {linesKitchenDone.length} dish{linesKitchenDone.length > 1 ? 'es' : ''} marked done
              </p>
              <p className="mt-1 text-emerald-900/80 font-medium">
                Waiting for {kitchenTotalCount - kitchenDoneCount} more from kitchen — then manager can complete order &amp; payment.
              </p>
            </div>
          )}
          {readyForCheckout && (
            <div className="rounded-xl border-2 border-emerald-500 bg-emerald-100 p-3 text-xs animate-in fade-in">
              <p className="font-black uppercase tracking-widest text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                All dishes ready — complete order below
              </p>
              <p className="mt-1 text-emerald-900 font-semibold">
                Order #{activeKitchenOrder?.orderNumber}: review items and take payment.
              </p>
            </div>
          )}
          {cartLines.length === 0 ? (
            <div className="h-full min-h-[8rem] flex flex-col items-center justify-center text-slate-300 space-y-4 p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-100">
                <ShoppingCart className="h-10 w-10 opacity-20" />
              </div>
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Your basket is currently empty</p>
              <p className="text-[10px] text-slate-400">Tap Kitchen on each line to send separately</p>
            </div>
          ) : (
            renderCartSections()
          )}
        </div>

        {renderCartFooter()}
      </div>

      {/* Mobile / tablet: sticky actions so checkout & basket stay visible (delivery rider flow) */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
        <div className="flex gap-2 max-w-lg mx-auto">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 font-bold text-xs sm:text-sm rounded-xl border-slate-200"
            onClick={() => setMobileCartOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5 shrink-0" />
            Basket ({linesInCart.length + linesInKitchen.length})
          </Button>
          {activeKitchenOrder && (
            <Button
              type="button"
              className="h-11 flex-1 font-black text-xs sm:text-sm uppercase tracking-wide premium-gradient rounded-xl border-none shadow-md"
              disabled={processingOrder || !readyForCheckout}
              onClick={() => {
                setMobileCartOpen(false);
                setPaymentMode('FULL');
                setAmountTendered('');
                setCheckoutAutoOpened(true);
                setIsPaymentModalOpen(true);
              }}
            >
              {readyForCheckout ? 'Complete order' : `Kitchen ${kitchenDoneCount}/${kitchenTotalCount || '…'} done`}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Cart Button */}
      <button
        onClick={() => setMobileCartOpen(true)}
        className="lg:hidden fixed bottom-[4.75rem] right-4 z-50 h-14 w-14 rounded-full premium-gradient shadow-xl flex items-center justify-center"
        aria-label="Open basket"
      >
        <ShoppingCart className="h-6 w-6 text-white" />
        {linesInCart.length > 0 && (
          <span className="absolute -top-1 -right-1 h-6 w-6 bg-rose-500 text-white text-xs font-black rounded-full flex items-center justify-center">
            {linesInCart.length}
          </span>
        )}
      </button>

      {/* Mobile Cart Sheet */}
      <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 gap-0 flex flex-col h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden"
        >
          <SheetHeader className="p-4 premium-gradient shrink-0">
            <SheetTitle className="text-white flex items-center gap-2 text-base">
              <ShoppingCart className="h-5 w-5 shrink-0" />
              Basket ({linesInCart.length + linesInKitchen.length})
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {cartLines.length === 0 ? (
              <div className="min-h-[10rem] flex flex-col items-center justify-center text-slate-300 space-y-3 p-6 text-center">
                <ShoppingCart className="h-12 w-12 opacity-20" />
                <p className="font-bold text-slate-400">Your basket is empty</p>
              </div>
            ) : (
              renderCartSections(true)
            )}
          </div>

          {renderCartFooter()}
        </SheetContent>
      </Sheet>

      {/* Payment Processing Modal */}
      <Dialog
        open={isPaymentModalOpen}
        onOpenChange={(open) => {
          setIsPaymentModalOpen(open);
          if (!open) {
            setCheckoutAutoOpened(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[min(92dvh,640px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900">
              Complete order & payment
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 sm:py-4 space-y-4 sm:space-y-6">
            {activeKitchenOrder && linesInKitchen.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                  Order #{activeKitchenOrder.orderNumber} — items for payment
                </p>
                <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                  {linesInKitchen.map((line) => (
                    <li
                      key={line.lineId}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5 min-w-0">
                        {line.kitchenStatus === 'COMPLETED' && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        )}
                        <span className="truncate">
                          {line.quantity}× {line.item.name}
                          {line.variantName ? ` (${line.variantName})` : ''}
                        </span>
                      </span>
                      <span className="font-bold text-slate-900 shrink-0">
                        Rs. {(line.totalPrice * line.quantity).toFixed(0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
             <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
               {['FULL', 'PARTIAL', 'SPLIT'].map(mode => (
                 <Button 
                   key={mode}
                   variant={paymentMode === mode ? 'default' : 'ghost'} 
                   size="sm" 
                   onClick={() => setPaymentMode(mode as any)} 
                   className={`flex-1 font-bold text-xs sm:text-sm ${paymentMode === mode ? 'shadow-sm' : 'text-slate-500'}`}
                 >
                   {mode}
                 </Button>
               ))}
             </div>

             <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-500 text-sm sm:text-base">Order Total</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">Rs. {payableTotal.toFixed(0)}</span>
             </div>

             {orderType === 'DELIVERY' && (
               <DeliveryDetailsFields
                 value={deliveryDetails}
                 onChange={setDeliveryDetails}
               />
             )}

             {paymentMode === 'FULL' && (
               <div className="space-y-3 sm:space-y-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Tendered (Cash)</label>
                  <Input 
                     type="number" 
                     placeholder="Enter amount given by customer..." 
                     className="h-12 sm:h-14 text-lg sm:text-xl font-bold"
                     value={amountTendered}
                     onChange={(e) => setAmountTendered(e.target.value)}
                   />
                  <select
                    className="flex h-12 w-full items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                    value={fullPaymentMethod}
                    onChange={(e) => setFullPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                   {amountTendered && parseFloat(amountTendered) > 0 && parseFloat(amountTendered) < payableTotal && (
                     <div className="flex items-center gap-2 text-xs sm:text-sm p-2.5 sm:p-3 bg-rose-50 text-rose-700 rounded-lg font-bold border border-rose-200">
                        <span className="text-rose-500">⚠</span>
                        <span>Insufficient! Need Rs. {(payableTotal - parseFloat(amountTendered)).toFixed(0)} more</span>
                     </div>
                   )}
                   {parseFloat(amountTendered) >= payableTotal && (
                     <div className="flex justify-between items-center text-xs sm:text-sm p-2.5 sm:p-3 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100">
                        <span>Change Due:</span>
                        <span className="text-lg sm:text-xl">Rs. {(parseFloat(amountTendered) - payableTotal).toFixed(0)}</span>
                     </div>
                   )}
                 </div>
                 <Button 
                   className="w-full h-12 sm:h-14 font-bold sm:font-black uppercase tracking-wide sm:tracking-widest bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base"
                   disabled={processingOrder || !amountTendered || parseFloat(amountTendered) < payableTotal}
                  onClick={() => finalizeOrder([{ amount: payableTotal, method: fullPaymentMethod }])}
                 >
                   {processingOrder ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Complete Payment'}
                 </Button>
               </div>
             )}

             {paymentMode === 'SPLIT' && (
               <div className="space-y-3 sm:space-y-4">
                 <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Split How Many Ways?</label>
                     <div className="flex items-center justify-center gap-3 sm:gap-4">
                        <Button variant="outline" size="icon" className="h-10 w-10 sm:h-11 sm:w-11" onClick={() => setSplitCount(Math.max(2, splitCount - 1))}><Minus className="h-4 w-4" /></Button>
                        <span className="text-xl sm:text-2xl font-black w-12 text-center">{splitCount}</span>
                        <Button variant="outline" size="icon" className="h-10 w-10 sm:h-11 sm:w-11" onClick={() => setSplitCount(splitCount + 1)}><Plus className="h-4 w-4" /></Button>
                     </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center">
                     <span className="font-bold text-indigo-700 text-sm sm:text-base">Per Person</span>
                     <span className="text-xl sm:text-2xl font-black text-indigo-900">Rs. {(payableTotal / splitCount).toFixed(0)}</span>
                  </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Method</label>
                    <select
                      className="flex h-12 w-full items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                      value={splitPaymentMethod}
                      onChange={(e) => setSplitPaymentMethod(e.target.value as PaymentMethod)}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                 </div>
                  <Button 
                    className="w-full h-12 sm:h-14 font-bold sm:font-black uppercase tracking-wide sm:tracking-widest bg-indigo-600 hover:bg-indigo-700 mt-2 sm:mt-4 text-sm sm:text-base"
                    disabled={processingOrder}
                    onClick={() => {
                      const splitVal = payableTotal / splitCount;
                      const payments = Array(splitCount).fill({ amount: splitVal, method: splitPaymentMethod });
                      finalizeOrder(payments);
                    }}
                  >
                    {processingOrder ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Split Payments'}
                  </Button>
               </div>
             )}

             {paymentMode === 'PARTIAL' && (
               <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Payment</label>
                    <Input 
                      type="number" 
                      placeholder="Enter amount..." 
                      className="h-11 sm:h-12 text-base sm:text-lg font-bold"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <select
                         className="col-span-2 flex h-10 w-full items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                         value={partialPaymentMethod}
                         onChange={(e) => setPartialPaymentMethod(e.target.value as PaymentMethod)}
                       >
                         {PAYMENT_METHODS.map((m) => (
                           <option key={m.value} value={m.value}>
                             {m.label}
                           </option>
                         ))}
                       </select>
                       <Button 
                         variant="outline" 
                         className="h-10 font-bold text-xs sm:text-sm col-span-2"
                         disabled={!amountTendered || isNaN(parseFloat(amountTendered)) || parseFloat(amountTendered) <= 0}
                         onClick={() => {
                           if (!amountTendered || isNaN(parseFloat(amountTendered))) return;
                           setPartialPayments([
                             ...partialPayments,
                             { amount: parseFloat(amountTendered), method: partialPaymentMethod },
                           ]);
                           setAmountTendered('');
                         }}
                       >
                         + Add Payment
                       </Button>
                    </div>
                  </div>

                  {partialPayments.length > 0 && (
                    <div className="space-y-2 mt-2 sm:mt-4 max-h-[25vh] overflow-y-auto">
                      {partialPayments.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 text-xs sm:text-sm font-bold border-b">
                           <div className="flex items-center gap-2">
                             <span className="text-slate-500">Payment {idx + 1}</span>
                             <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.method === 'CASH' ? 'bg-emerald-100 text-emerald-700' : p.method === 'CARD' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                               {p.method}
                             </span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span>Rs. {p.amount.toFixed(0)}</span>
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-6 w-6 text-slate-400 hover:text-rose-500"
                               onClick={() => setPartialPayments(partialPayments.filter((_, i) => i !== idx))}
                             >
                               <Trash2 className="h-3 w-3" />
                             </Button>
                           </div>
                        </div>
                      ))}
                      <div className="flex justify-between p-2 text-xs sm:text-sm font-black text-rose-600">
                         <span>Remaining Balance</span>
                         <span>Rs. {Math.max(0, payableTotal - partialPayments.reduce((s, p) => s + p.amount, 0)).toFixed(0)}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full h-12 sm:h-14 font-bold sm:font-black uppercase tracking-wide sm:tracking-widest bg-indigo-600 hover:bg-indigo-700 mt-2 sm:mt-4 text-sm sm:text-base"
                    disabled={processingOrder || partialPayments.reduce((s, p) => s + p.amount, 0) < payableTotal}
                    onClick={() => finalizeOrder(partialPayments)}
                  >
                    {processingOrder ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Complete Order'}
                  </Button>
               </div>
             )}
          </div>
        </DialogContent>
      </Dialog>


      {/* Item Variant Modal */}
      <Dialog open={!!selectedItemForModal} onOpenChange={() => setSelectedItemForModal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900">{selectedItemForModal?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2 sm:py-4 space-y-4 sm:space-y-6">
             {selectedItemForModal?.variants && (
               <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Size / Option</label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                     {selectedItemForModal.variants.map(v => (
                        <Button 
                          key={v.name}
                          variant={selectedVariant === v.name ? 'default' : 'outline'}
                          className={`h-auto py-2.5 sm:py-3 px-3 sm:px-4 flex flex-col items-start gap-0.5 sm:gap-1 justify-center rounded-xl transition-all ${selectedVariant === v.name ? 'premium-gradient border-none shadow-md ring-2 ring-indigo-500 ring-offset-2' : 'border-slate-100 hover:border-indigo-200'}`}
                          onClick={() => {
                            setSelectedVariant(v.name);
                            setSelectedAddons((prev) =>
                              prev.filter((name) => !name.startsWith('Extra Topping')),
                            );
                          }}
                        >
                           <span className="font-bold text-xs sm:text-sm">{v.name}</span>
                           <span className={`text-[10px] sm:text-xs ${selectedVariant === v.name ? 'text-white/80' : 'text-slate-500'}`}>Rs. {v.price}</span>
                        </Button>
                     ))}
                  </div>
               </div>
             )}

             {modalAddonOptions.length > 0 && (
               <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Extra toppings</label>
                  <div className="space-y-1.5 sm:space-y-2 max-h-[30vh] sm:max-h-none overflow-y-auto">
                     {modalAddonOptions.map(a => (
                        <div 
                          key={a.name}
                          className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${selectedAddons.includes(a.name) ? 'bg-indigo-50 border-indigo-200' : 'border-slate-100 hover:border-slate-200'}`}
                          onClick={() => {
                            if (selectedAddons.includes(a.name)) {
                              setSelectedAddons(selectedAddons.filter(id => id !== a.name));
                            } else {
                              setSelectedAddons([...selectedAddons, a.name]);
                            }
                          }}
                        >
                           <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`h-5 w-5 rounded flex items-center justify-center transition-colors ${selectedAddons.includes(a.name) ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'}`}>
                                 {selectedAddons.includes(a.name) && <Plus className="h-3 w-3" />}
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-slate-800">{a.name}</span>
                           </div>
                           <span className="text-[10px] sm:text-xs font-bold text-slate-500">+Rs. {a.price}</span>
                        </div>
                     ))}
                  </div>
               </div>
             )}
          </div>
          <DialogFooter className="mt-2 sm:mt-4">
             <Button 
                className="w-full h-12 sm:h-14 premium-gradient font-bold sm:font-black uppercase tracking-wide sm:tracking-widest rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-100 border-none text-sm sm:text-base"
                onClick={() => selectedItemForModal && addToCart(selectedItemForModal, selectedVariant, selectedAddons)}
             >
                Add to Basket • Rs. {(
                  (selectedItemForModal?.variants?.find(v => v.name === selectedVariant)?.price || selectedItemForModal?.price || 0) +
                  (selectedItemForModal?.addons?.filter(a => selectedAddons.includes(a.name))?.reduce((sum, a) => sum + a.price, 0) || 0)
                ).toFixed(0)}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kitchen Ticket Modal */}
      <Dialog open={!!kitchenTicket} onOpenChange={(open) => !open && setKitchenTicket(null)}>
        <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
          <div className="bg-amber-600 p-4 sm:p-6 text-white">
            <h2 className="text-lg sm:text-xl font-black">
              {kitchenTicket?.isAddition ? 'More items sent to kitchen' : 'Kitchen ticket sent'}
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm">Print this slip for kitchen staff</p>
          </div>
          <div className="p-4 sm:p-6 text-sm space-y-2">
            <p><span className="font-semibold">Order:</span> #{kitchenTicket?.orderNumber}</p>
            <p><span className="font-semibold">Type:</span> {kitchenTicket?.orderType?.replace('_', ' ')}</p>
            {kitchenTicket?.orderType === 'DINE_IN' && (
              <p><span className="font-semibold">Table:</span> {kitchenTicket?.tableName}</p>
            )}
            {kitchenTicket?.delivery && (
              <p><span className="font-semibold">Rider:</span> {kitchenTicket.delivery.riderName}</p>
            )}
            <div className="border-t pt-2 mt-2 space-y-1">
              {kitchenTicket?.cart?.map((c: any, i: number) => (
                <p key={i}>
                  {c.quantity}x {c.item.name}
                  {c.variantName ? ` (${c.variantName})` : ''}
                  {c.addonNames?.length ? ` + ${c.addonNames.join(', ')}` : ''}
                </p>
              ))}
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-slate-50 border-t flex gap-2 sm:gap-3">
            <Button
              className="flex-1 h-11 sm:h-12 bg-amber-600 hover:bg-amber-700 font-bold text-white rounded-xl text-sm sm:text-base"
              onClick={() => window.print()}
            >
              <Printer className="mr-2 h-4 w-4" /> Print Ticket
            </Button>
            <Button
              variant="outline"
              className="h-11 sm:h-12 px-4 sm:px-6 font-bold rounded-xl text-sm sm:text-base"
              onClick={() => setKitchenTicket(null)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Layout Modal */}
      <Dialog open={!!orderSuccess} onOpenChange={(open) => !open && setOrderSuccess(null)}>
        <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 sm:p-6 text-white print:hidden">
              <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-lg sm:text-xl font-black">Order Complete!</h2>
                    <p className="text-indigo-200 text-xs sm:text-sm">Receipt ready for printing</p>
                 </div>
                 <div className="h-12 w-12 sm:h-14 sm:w-14 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8" />
                 </div>
              </div>
           </div>
           
           <div id="printable-receipt" className="bg-white text-black p-4 sm:p-6 max-h-[50vh] sm:max-h-none overflow-y-auto">
              <div className="text-center pb-4 mb-4 border-b-2 border-dashed border-slate-200">
                 <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3 print:hidden">
                    <ShoppingCart className="h-6 w-6 text-indigo-600" />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">{BRAND.name}</h2>
                 <p className="text-xs text-slate-500 mt-1">{VENUE.addressLines.join(', ')}</p>
                 <p className="text-xs text-slate-500">Tel: {VENUE.phones[0]!.numbers[0]}</p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-3 mb-4 print:bg-white print:p-0">
                 <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                       <span className="text-slate-400 block">Date</span>
                       <span className="font-semibold text-slate-700">{orderSuccess?.timestamp?.toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-slate-400 block">Time</span>
                       <span className="font-semibold text-slate-700">{orderSuccess?.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>
                       <span className="text-slate-400 block">Cashier</span>
                       <span className="font-semibold text-slate-700">{orderSuccess?.cashier}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-slate-400 block">Order Type</span>
                       <span className="font-semibold text-slate-700">{orderSuccess?.orderType?.replace('_', ' ')}</span>
                    </div>
                 </div>
              </div>

              {orderSuccess?.delivery && (
                <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs">
                  <p className="mb-2 font-black uppercase tracking-wider text-indigo-800">Delivery</p>
                  <p><span className="text-slate-500">Rider:</span> <span className="font-semibold text-slate-800">{orderSuccess.delivery.riderName}</span></p>
                  <p className="mt-1"><span className="text-slate-500">Cell:</span> <span className="font-semibold text-slate-800">{orderSuccess.delivery.phone}</span></p>
                  <p className="mt-1"><span className="text-slate-500">Address:</span> <span className="font-semibold text-slate-800">{orderSuccess.delivery.address}</span></p>
                  <p className="mt-2 text-[10px] text-slate-500">Completed {orderSuccess.timestamp?.toLocaleString()}</p>
                </div>
              )}

              <div className="mb-4">
                 <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100">
                    <span>Item</span>
                    <span>Amount</span>
                 </div>
                 <div className="space-y-2">
                    {orderSuccess?.cart?.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between items-start py-1">
                         <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2">
                               <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold print:bg-slate-100 print:text-slate-700">{c.quantity}</span>
                               <span className="font-semibold text-sm text-slate-800">{c.item.name}</span>
                            </div>
                            {c.variantName && <span className="text-[11px] text-slate-500 ml-7 block">↳ {c.variantName}</span>}
                            {c.addonNames?.map((a: string) => <span key={a} className="text-[11px] text-emerald-600 ml-7 block">+ {a}</span>)}
                         </div>
                         <span className="font-bold text-sm text-slate-800">Rs. {(c.totalPrice * c.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="border-t-2 border-dashed border-slate-200 pt-4 mb-4">
                 <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold">Rs. {orderSuccess?.subtotal?.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-500">Tax (0%)</span>
                    <span className="text-slate-500">Rs. 0</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-900 text-white rounded-lg p-3 print:bg-slate-100 print:text-slate-900">
                    <span className="font-black text-sm uppercase tracking-wide">Total</span>
                    <span className="font-black text-xl">Rs. {orderSuccess?.subtotal?.toLocaleString()}</span>
                 </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-3 mb-4 print:bg-white print:border print:border-slate-200">
                 <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">Payment Details</div>
                 {orderSuccess?.payments?.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                       <span className="text-emerald-700">{p.method} Payment</span>
                       <span className="font-semibold text-emerald-800">Rs. {p.amount.toLocaleString()}</span>
                    </div>
                 ))}
                 {(orderSuccess?.payments?.reduce((s:number,p:any)=>s+p.amount,0) || 0) > (orderSuccess?.subtotal || 0) && (
                    <div className="flex justify-between text-sm mt-2 pt-2 border-t border-emerald-200">
                       <span className="font-bold text-emerald-800">Change Due</span>
                       <span className="font-black text-emerald-800">Rs. {((orderSuccess?.payments?.reduce((s:number,p:any)=>s+p.amount,0) || 0) - (orderSuccess?.subtotal || 0)).toLocaleString()}</span>
                    </div>
                 )}
              </div>

              <div className="text-center pt-4 border-t border-dashed border-slate-200">
                 <p className="font-black text-slate-900 mb-1">Thank You!</p>
                 <p className="text-[11px] text-slate-500">Please come again</p>
                 <div className="flex items-center justify-center gap-1 mt-3 text-[10px] text-slate-400">
                    <span>Powered by</span>
                    <span className="font-bold text-indigo-600">RestoOS</span>
                 </div>
              </div>
           </div>
           
           <div className="p-3 sm:p-4 bg-slate-50 border-t flex gap-2 sm:gap-3 print:hidden">
              <Button 
                 className="flex-1 h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded-xl text-sm sm:text-base"
                 onClick={() => window.print()}
              >
                 <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <Button 
                 variant="outline"
                 className="h-11 sm:h-12 px-4 sm:px-6 font-bold rounded-xl text-sm sm:text-base"
                 onClick={() => setOrderSuccess(null)}
              >
                 Done
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Print-only receipt: portaled to body so @media print can hide all other body children without layout from the dashboard (fixes blank first page). */}
      {printPortalReady &&
        kitchenTicket &&
        createPortal(
          <div id="print-kitchen" aria-hidden>
            <div style={{ width: '100%', fontFamily: 'Courier New, Courier, monospace', fontSize: '15px', color: '#000', fontWeight: 700 }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>
                  {kitchenTicket.isAddition ? 'KITCHEN — ADD ITEMS' : 'KITCHEN TICKET'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>#{kitchenTicket.orderNumber}</div>
              </div>
              <div style={{ fontSize: '13px', marginBottom: '8px', fontWeight: 700 }}>
                <div>Type: {kitchenTicket.orderType?.replace('_', ' ')}</div>
                {kitchenTicket.orderType === 'DINE_IN' && <div>Table: {kitchenTicket.tableName}</div>}
                {kitchenTicket.delivery && <div>Rider: {kitchenTicket.delivery.riderName}</div>}
              </div>
              <div style={{ borderTop: '2px solid #000', paddingTop: '8px' }}>
                {kitchenTicket.cart?.map((c: any, i: number) => (
                  <div key={i} style={{ marginBottom: '6px', fontWeight: 700 }}>
                    {c.quantity}x {c.item.name} {c.variantName ? `(${c.variantName})` : ''}
                    {c.addonNames?.map((a: string) => ` + ${a}`).join('')}
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
      {printPortalReady &&
        orderSuccess &&
        createPortal(
          <div id="print-receipt" aria-hidden>
            <div style={{ width: '100%', fontFamily: 'Courier New, Courier, monospace', fontSize: '15px', color: '#000', fontWeight: 700 }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{BRAND.name}</div>
                <div style={{ fontSize: '11px', fontWeight: 700 }}>{VENUE.addressLines.join(', ')}</div>
                <div style={{ fontSize: '11px', fontWeight: 700 }}>Tel: {VENUE.phones[0]!.numbers[0]}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', fontWeight: 700 }}>
                <span>Date: {orderSuccess?.timestamp?.toLocaleDateString()}</span>
                <span>Time: {orderSuccess?.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px', fontWeight: 700 }}>
                <span>Cashier: {orderSuccess?.cashier}</span>
                <span>{orderSuccess?.orderType?.replace('_', ' ')}</span>
              </div>

              {orderSuccess?.delivery && (
                <div style={{ borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px', fontSize: '11px', fontWeight: 700 }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>DELIVERY</div>
                  <div>Rider: {orderSuccess.delivery.riderName}</div>
                  <div>Cell: {orderSuccess.delivery.phone}</div>
                  <div>Addr: {orderSuccess.delivery.address}</div>
                </div>
              )}

              <div style={{ borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '11px', marginBottom: '6px' }}>
                  <span>ITEM</span>
                  <span>AMT</span>
                </div>
                {orderSuccess?.cart?.map((c: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <div style={{ fontWeight: 700 }}>{c.quantity}x {c.item.name}</div>
                      {c.variantName && <div style={{ fontSize: '11px', marginLeft: '10px', fontWeight: 700 }}>- {c.variantName}</div>}
                      {c.addonNames?.map((a: string) => <div key={a} style={{ fontSize: '11px', marginLeft: '10px', fontWeight: 700 }}>+ {a}</div>)}
                    </div>
                    <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Rs.{(c.totalPrice * c.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px', fontWeight: 700 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>Subtotal</span>
                  <span>Rs.{orderSuccess?.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Tax (0%)</span>
                  <span>Rs.0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', borderTop: '2px solid #000', paddingTop: '6px', marginTop: '4px' }}>
                  <span>TOTAL</span>
                  <span>Rs.{orderSuccess?.subtotal}</span>
                </div>
              </div>

              <div style={{ marginBottom: '8px', fontWeight: 700 }}>
                {orderSuccess?.payments?.map((p: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{p.method}</span>
                    <span>Rs.{p.amount}</span>
                  </div>
                ))}
                {(orderSuccess?.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0) > (orderSuccess?.subtotal || 0) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '4px' }}>
                    <span>CHANGE</span>
                    <span>Rs.{(orderSuccess?.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0) - (orderSuccess?.subtotal || 0)}</span>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', borderTop: '2px solid #000', paddingTop: '8px', fontWeight: 700 }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Thank You!</div>
                <div style={{ fontSize: '11px', fontWeight: 700 }}>Please come again</div>
                <div style={{ fontSize: '10px', marginTop: '6px', fontWeight: 700 }}>Powered by RestoOS</div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
