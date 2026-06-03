'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Loader2, CheckCircle2, Printer, X } from 'lucide-react';
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

interface CartItem {
  item: MenuItem;
  quantity: number;
  variantName?: string;
  addonNames?: string[];
  totalPrice: number;
}

interface ActiveKitchenOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  table?: { name?: string } | null;
}

const getOrderPaidAmount = (order: any): number =>
  (order?.payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

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
        {item.image ? (
          <OptimizedImage 
            src={item.image} 
            alt={item.name} 
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            fallback={<ImageFallback />}
          />
        ) : (
          <ImageFallback />
        )}
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
  cartItem: CartItem;
  index: number;
  onUpdateQuantity: (idx: number, delta: number) => void;
  onRemove: (idx: number) => void;
}

const CartImageFallback = memo(function CartImageFallback() {
  return <ShoppingCart className="h-4 w-4 opacity-10" />;
});

const CartItemRow = memo(function CartItemRow({ cartItem, index, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const { item, quantity, variantName, totalPrice } = cartItem;
  
  return (
    <div className="flex gap-4 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors group">
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
          </div>
          <span className="font-black text-slate-900 text-sm">Rs. {(totalPrice * quantity).toFixed(0)}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 bg-white border border-slate-100 shadow-sm rounded-full p-0.5">
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-100 text-slate-600" onClick={() => onUpdateQuantity(index, -1)}><Minus className="h-3 w-3" /></Button>
            <span className="w-5 text-center text-xs font-bold text-slate-800">{quantity}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-100 text-slate-600" onClick={() => onUpdateQuantity(index, 1)}><Plus className="h-3 w-3" /></Button>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-full" onClick={() => onRemove(index)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<any>('DINE_IN');
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [posUser, setPosUser] = useState<string | null>(null);
  const [pinError, setPinError] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

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
          setActiveKitchenOrder({
            id: fresh.id,
            orderNumber: fresh.orderNumber,
            status: fresh.status,
            totalAmount: fresh.totalAmount,
            type: fresh.type,
            table: fresh.table,
          });
        }
      } catch (error) {
        console.error('Failed to poll kitchen order status:', error);
      }
    };

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [activeKitchenOrder?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeKitchenOrder) return;
    if (activeKitchenOrder.status !== 'COMPLETED') return;
    if (checkoutAutoOpened) return;

    setCheckoutAutoOpened(true);
    setPaymentMode('FULL');
    setAmountTendered('');
    setIsPaymentModalOpen(true);
  }, [activeKitchenOrder, checkoutAutoOpened]);

  const fetchData = async () => {
    try {
      const [catsRes, itemsRes, branchesRes, tablesRes, ordersRes] = await Promise.all([
        apiClient.get('/menu/categories'),
        apiClient.get('/menu/items'),
        apiClient.get('/branches'),
        apiClient.get('/tables'),
        apiClient.get('/orders'),
      ]);
      setCategories(catsRes.data);
      setItems(itemsRes.data);
      setBranches(branchesRes.data);
      setTables(tablesRes.data);

      // Recover latest unpaid kitchen order so checkout survives refresh/navigation.
      const unpaidOrders = (ordersRes.data || []).filter((o: any) => {
        if (o.status === 'CANCELLED') return false;
        return getOrderPaidAmount(o) < (o.totalAmount || 0);
      });

      if (unpaidOrders.length > 0) {
        const latest = unpaidOrders[0];
        setActiveKitchenOrder((prev) => {
          if (prev && prev.id === latest.id && prev.status === latest.status) return prev;
          return {
            id: latest.id,
            orderNumber: latest.orderNumber,
            status: latest.status,
            totalAmount: latest.totalAmount,
            type: latest.type,
            table: latest.table,
          };
        });
      }
    } catch (error) {

      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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

    setCart(prev => {
      const existing = prev.find(p => 
        p.item.id === item.id && 
        p.variantName === variantName && 
        JSON.stringify(p.addonNames) === JSON.stringify(addonNames)
      );

      if (existing) {
        return prev.map(p => 
          (p.item.id === item.id && p.variantName === variantName && JSON.stringify(p.addonNames) === JSON.stringify(addonNames)) 
          ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { item, quantity: 1, variantName, addonNames, totalPrice: finalPrice }];
    });
    
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

  const orderItemsPayload = useCallback(
    () =>
      cart.map((c) => ({
        itemId: c.item.id,
        quantity: c.quantity,
        variantName: c.variantName,
        addonNames: c.addonNames,
      })),
    [cart],
  );

  const printKitchenSlip = useCallback(
    (
      orderNumber: string,
      items: CartItem[],
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

  const sendToKitchen = async () => {
    if (cart.length === 0 || branches.length === 0) return;

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

    const cartSnapshot = [...cart];
    setProcessingOrder(true);
    try {
      if (activeKitchenOrder) {
        const updated = await apiClient.patch(`/orders/${activeKitchenOrder.id}/items`, {
          items: orderItemsPayload(),
        });

        setActiveKitchenOrder({
          id: updated.data.id,
          orderNumber: updated.data.orderNumber,
          status: updated.data.status,
          totalAmount: updated.data.totalAmount,
          type: updated.data.type,
          table: updated.data.table,
        });
        if (updated.data.status !== 'COMPLETED') {
          setCheckoutAutoOpened(false);
          setIsPaymentModalOpen(false);
        }

        printKitchenSlip(
          updated.data.orderNumber,
          cartSnapshot,
          updated.data.type,
          updated.data.type === 'DINE_IN'
            ? updated.data.table?.name || activeKitchenOrder.table?.name || 'N/A'
            : 'N/A',
          updated.data.type === 'DELIVERY'
            ? {
                riderName: updated.data.deliveryRiderName || '',
                phone: updated.data.deliveryPhone || '',
                address: updated.data.deliveryAddress || '',
              }
            : null,
          true,
        );
      } else {
        const created = await apiClient.post('/orders', {
          type: orderType,
          branchId: branches[0].id,
          tableId: orderType === 'DINE_IN' && selectedTableId ? selectedTableId : undefined,
          items: orderItemsPayload(),
          ...(orderType === 'DELIVERY'
            ? {
                deliveryRiderName: deliveryDetails.riderName.trim(),
                deliveryPhone: deliveryDetails.phone.trim(),
                deliveryAddress: deliveryDetails.address.trim(),
              }
            : {}),
        });

        setActiveKitchenOrder({
          id: created.data.id,
          orderNumber: created.data.orderNumber,
          status: created.data.status,
          totalAmount: created.data.totalAmount,
          type: created.data.type,
          table: created.data.table,
        });
        setCheckoutAutoOpened(false);

        printKitchenSlip(
          created.data.orderNumber,
          cartSnapshot,
          orderType,
          orderType === 'DINE_IN'
            ? tables.find((t) => t.id === selectedTableId)?.name || 'N/A'
            : 'N/A',
          orderType === 'DELIVERY'
            ? {
                riderName: deliveryDetails.riderName.trim(),
                phone: deliveryDetails.phone.trim(),
                address: deliveryDetails.address.trim(),
              }
            : null,
        );
      }

      setCart([]);
    } catch (error) {
      console.error('Kitchen ticket failed:', error);
      alert('Failed to send order to kitchen.');
    } finally {
      setProcessingOrder(false);
    }
  };

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

  const updateQuantity = useCallback((idx: number, delta: number) => {
    setCart(prev => prev.map((p, i) => {
      if (i === idx) {
        const newQ = p.quantity + delta;
        return newQ > 0 ? { ...p, quantity: newQ } : p;
      }
      return p;
    }));
  }, []);

  const removeFromCart = useCallback((idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const subtotal = useMemo(() => 
    cart.reduce((sum, p) => sum + (p.totalPrice * p.quantity), 0), 
    [cart]
  );
  const payableTotal = activeKitchenOrder?.totalAmount ?? subtotal;

  const availableTables = useMemo(() => {
    const tableNumber = (name: string) => {
      const match = name?.match(/(\d+)\s*$/);
      return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
    };

    return tables
      .filter((t) => t.status === 'AVAILABLE')
      .slice()
      .sort((a, b) => {
        const diff = tableNumber(a.name) - tableNumber(b.name);
        if (diff !== 0) return diff;
        return String(a.name).localeCompare(String(b.name));
      });
  }, [tables]);

  const filteredItems = useMemo(() => 
    items.filter(item => 
      (activeCategory === 'All' || item.categoryId === activeCategory) &&
      item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    ),
    [items, activeCategory, debouncedSearchQuery]
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Initializing Terminal...</p>
      </div>
    );
  }

  const handlePinSubmit = async () => {
    if (pinInput.length < 4) return;
    try {
      setLoading(true);
      const res = await apiClient.post('/auth/staff/login-pin', { pin: pinInput });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('userRole', res.data.user?.role || 'Staff');
      localStorage.setItem(
        'userPermissions',
        JSON.stringify(res.data.user?.permissions ?? []),
      );
      setPosUser(res.data.user?.name || 'Staff');
      setIsLocked(false);
      setPinError('');
    } catch (error) {
      setPinError('Invalid PIN code. Try again.');
      setPinInput('');
    } finally {
      setLoading(false);
    }
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-4">
         <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center">
            <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
               <CreditCard className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Unlock Terminal</h2>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-8 text-center">Enter 4-Digit Staff PIN</p>
            
            <div className="flex gap-4 mb-8">
               {[0,1,2,3].map(i => (
                 <div key={i} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl font-black ${pinInput.length > i ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-200'}`}>
                    {pinInput.length > i && <div className="w-3 h-3 bg-white rounded-full"></div>}
                 </div>
               ))}
            </div>
            {pinError && <p className="text-rose-500 text-sm font-bold mb-4">{pinError}</p>}

            <div className="grid grid-cols-3 gap-4 w-full mb-6">
               {[1,2,3,4,5,6,7,8,9].map(num => (
                 <Button key={num} variant="outline" className="h-16 text-2xl font-black rounded-2xl hover:bg-slate-100 border-slate-200" onClick={() => setPinInput(p => (p.length < 4 ? p + num : p))}>
                   {num}
                 </Button>
               ))}
               <Button variant="ghost" className="h-16 text-xl font-black rounded-2xl text-slate-400" onClick={() => setPinInput('')}>C</Button>
               <Button variant="outline" className="h-16 text-2xl font-black rounded-2xl hover:bg-slate-100 border-slate-200" onClick={() => setPinInput(p => (p.length < 4 ? p + '0' : p))}>0</Button>
               <Button variant="ghost" className="h-16 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50" onClick={() => setPinInput(p => p.slice(0, -1))}><Minus className="h-6 w-6" /></Button>
            </div>
            <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-black uppercase tracking-widest rounded-2xl" disabled={pinInput.length !== 4 || loading} onClick={handlePinSubmit}>
               {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Unlock System'}
            </Button>
         </div>
         <div className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
            RestoOS Premium POS Enterprise System
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] -m-3 sm:-m-6 overflow-hidden bg-background">
      {/* Items Section */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
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

        <div className="flex-1 p-3 sm:p-6 overflow-y-auto custom-scrollbar pb-20 lg:pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
            {filteredItems.map(item => (
              <MenuItemCard key={item.id} item={item} onClick={onItemClick} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Cart Sidebar */}
      <div className="hidden lg:flex w-[380px] bg-white border-l shadow-xl flex-col shrink-0 relative">
        {orderSuccess && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
             <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 scale-up">
                <CheckCircle2 className="h-10 w-10" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Order Confirmed!</h2>
             <p className="text-slate-500 text-sm">Printing ticket for Kitchen Display System...</p>
          </div>
        )}

        <div className="p-5 premium-gradient flex items-center gap-3 shadow-lg">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg leading-none">Order Basket</h2>
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Ref: #POS-{orderRef}</p>
          </div>
          <span className="ml-auto bg-white text-primary px-3 py-1 rounded-full text-xs font-black shadow-sm">{cart.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 p-8 text-center">
              <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-100">
                <ShoppingCart className="h-10 w-10 opacity-20" />
              </div>
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Your basket is currently empty</p>
            </div>
          ) : (
            cart.map((p, i) => (
              <CartItemRow
                key={`${p.item.id}-${p.variantName || ''}-${i}`}
                cartItem={p}
                index={i}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))
          )}
        </div>

        <div className="bg-slate-50/80 backdrop-blur-md p-6 border-t border-slate-100 mt-auto">
          {orderType === 'DINE_IN' && (
             <div className="mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Assign Table</label>
                <select 
                  className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                >
                  <option value="" disabled>Select an available table...</option>
                  {availableTables.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.capacity} seats)</option>
                  ))}
                  {availableTables.length === 0 && <option value="" disabled>No tables available</option>}
                </select>
             </div>
          )}

          {orderType === 'DELIVERY' && (
            <div className="mb-4">
              <DeliveryDetailsFields
                variant="compact"
                value={deliveryDetails}
                onChange={setDeliveryDetails}
              />
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-2xl font-black text-slate-900 pt-4">
              <span className="tracking-tighter">TOTAL</span>
              <span className="text-primary truncate ml-2">
                Rs. {(activeKitchenOrder?.totalAmount ?? subtotal).toFixed(0)}
              </span>
            </div>
          </div>

          <div className="grid gap-3">
             {activeKitchenOrder && (
               <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
                 <p className="font-black uppercase tracking-widest text-slate-500">Open order</p>
                 <p className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800">
                   #{activeKitchenOrder.orderNumber}
                 </p>
                 <p className="mt-1 font-semibold text-slate-800">
                   {activeKitchenOrder.status === 'COMPLETED' ? 'Ready for checkout' : `Kitchen: ${activeKitchenOrder.status}`}
                 </p>
                 <p className="mt-1 text-slate-500">
                   {activeKitchenOrder.type === 'DINE_IN'
                     ? `Table: ${activeKitchenOrder.table?.name || 'N/A'}`
                     : activeKitchenOrder.type === 'DELIVERY'
                       ? 'Delivery order'
                       : 'Takeaway order'}
                 </p>
                 <p className="mt-1 text-[10px] text-slate-400">Add more items to the cart, then send again.</p>
               </div>
             )}
             <Button
               className="h-14 font-black text-sm uppercase tracking-widest bg-amber-600 hover:bg-amber-700 shadow-lg border-none rounded-2xl w-full"
               disabled={
                 cart.length === 0 ||
                 processingOrder ||
                 (!activeKitchenOrder &&
                   ((orderType === 'DINE_IN' && !selectedTableId) ||
                     (orderType === 'DELIVERY' && !isDeliveryDetailsValid(deliveryDetails))))
               }
               onClick={sendToKitchen}
             >
               {processingOrder ? (
                 <Loader2 className="h-5 w-5 animate-spin" />
               ) : activeKitchenOrder ? (
                 'Send more to Kitchen'
               ) : (
                 'Send to Kitchen'
               )}
             </Button>
             {activeKitchenOrder && (
               <Button
                 className="h-14 font-black text-sm uppercase tracking-widest premium-gradient shadow-lg shadow-indigo-100 border-none rounded-2xl w-full"
                 disabled={processingOrder || activeKitchenOrder.status !== 'COMPLETED'}
                 onClick={() => {
                   setPaymentMode('FULL');
                   setAmountTendered('');
                   setIsPaymentModalOpen(true);
                 }}
               >
                 {activeKitchenOrder.status === 'COMPLETED'
                   ? 'Proceed to Checkout'
                   : `Checkout after kitchen marks done`}
               </Button>
             )}
          </div>
        </div>
      </div>

      {/* Mobile Cart Button */}
      <button
        onClick={() => setMobileCartOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full premium-gradient shadow-xl flex items-center justify-center"
      >
        <ShoppingCart className="h-6 w-6 text-white" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 h-6 w-6 bg-rose-500 text-white text-xs font-black rounded-full flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </button>

      {/* Mobile Cart Sheet */}
      <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="p-4 premium-gradient">
            <SheetTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Basket ({cart.length})
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 p-8 text-center">
                <ShoppingCart className="h-12 w-12 opacity-20" />
                <p className="font-bold text-slate-400">Your basket is empty</p>
              </div>
            ) : (
              cart.map((p, i) => (
                <CartItemRow
                  key={`mobile-${p.item.id}-${p.variantName || ''}-${i}`}
                  cartItem={p}
                  index={i}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))
            )}
          </div>

          <div className="bg-slate-50 p-4 border-t mt-auto">
            {orderType === 'DELIVERY' && (
              <div className="mb-4">
                <DeliveryDetailsFields
                  variant="compact"
                  value={deliveryDetails}
                  onChange={setDeliveryDetails}
                />
              </div>
            )}
            <div className="flex justify-between text-xl font-black text-slate-900 mb-4">
              <span>TOTAL</span>
              <span className="text-primary">Rs. {(activeKitchenOrder?.totalAmount ?? subtotal).toFixed(0)}</span>
            </div>
            <Button
              className="w-full h-14 font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-700 rounded-xl"
              disabled={
                cart.length === 0 ||
                processingOrder ||
                (!activeKitchenOrder &&
                  ((orderType === 'DINE_IN' && !selectedTableId) ||
                    (orderType === 'DELIVERY' && !isDeliveryDetailsValid(deliveryDetails))))
              }
              onClick={async () => {
                setMobileCartOpen(false);
                await sendToKitchen();
              }}
            >
              {processingOrder ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : activeKitchenOrder ? (
                'Send more to Kitchen'
              ) : (
                'Send to Kitchen'
              )}
            </Button>
            {activeKitchenOrder && (
              <Button
                className="w-full h-14 mt-2 font-black uppercase tracking-widest premium-gradient rounded-xl"
                disabled={processingOrder || activeKitchenOrder.status !== 'COMPLETED'}
                onClick={() => {
                  setMobileCartOpen(false);
                  setPaymentMode('FULL');
                  setAmountTendered('');
                  setIsPaymentModalOpen(true);
                }}
              >
                {activeKitchenOrder.status === 'COMPLETED'
                  ? 'Proceed to Checkout'
                  : 'Checkout after kitchen marks done'}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Payment Processing Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900">Payment Processing</DialogTitle>
          </DialogHeader>
          <div className="py-2 sm:py-4 space-y-4 sm:space-y-6">
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
