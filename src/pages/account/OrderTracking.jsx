import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Check, Clock, Package, Truck, ShoppingBag, MapPin, ClipboardCheck, AlertTriangle } from 'lucide-react';

export default function OrderTracking() {
  const { orderId } = useParams();
  const { customer, loadingCustomer } = useApp();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // 6 Stages of Order Delivery
  const stages = [
    { key: 'Pending', label: 'Order Placed', icon: Clock },
    { key: 'Confirmed', label: 'Confirmed', icon: ClipboardCheck },
    { key: 'Processing', label: 'Processing', icon: Package },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: Check }
  ];

  const fetchOrderDetails = useCallback(async () => {
    try {
      setErrorMsg('');

      // 1. Fetch current authenticated user session
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        navigate('/account/login');
        return;
      }

      // 2. Fetch specific order
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderErr) {
        console.error('order fetch error:', orderErr);
        throw new Error('Unable to load your order. Please try again.');
      }

      // 3. Customer Ownership Validation Check
      if (orderData.user_id !== user.id) {
        console.error('Security alert: Customer attempted to view unauthorized order.');
        navigate('/account');
        return;
      }

      setOrder(orderData);

      // 4. Fetch Order Line Items
      const { data: itemsData, error: itemsErr } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsErr) {
        console.error('order items fetch error:', itemsErr);
      } else {
        setOrderItems(itemsData || []);
      }

      // 5. Fetch Order Status Log History
      const { data: historyData, error: historyErr } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (historyErr) {
        console.error('order status history fetch error:', historyErr);
      } else {
        setStatusHistory(historyData || []);
      }

    } catch (err) {
      console.error('Order tracking load failed:', err);
      setErrorMsg(err.message || 'Unable to load order details.');
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

  useEffect(() => {
    if (!loadingCustomer && !customer) {
      navigate('/account/login');
      return;
    }

    if (orderId) {
      fetchOrderDetails();

      // Hook up realtime listener on public.orders for changes on this order id
      const realtimeChannel = supabase
        .channel(`order-tracking-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderId}`
          },
          (payload) => {
            console.log('Realtime change noticed for order tracking page:', payload);
            fetchOrderDetails();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(realtimeChannel);
      };
    }
  }, [orderId, customer, loadingCustomer, navigate, fetchOrderDetails]);

  const getHistoryTime = (stageKey) => {
    // Check casing and underscore differences
    const record = statusHistory.find(
      h => h.status.toLowerCase().replace(/_/g, ' ') === stageKey.toLowerCase().replace(/_/g, ' ')
    );
    if (record) {
      const date = new Date(record.created_at);
      return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' ' +
             date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return null;
  };

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm('Cancel this order?');
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      // 1. Fetch current order details to verify stock adjustment state
      const { data: orderData, error: fetchOrderErr } = await supabase
        .from('orders')
        .select('order_status, inventory_adjusted')
        .eq('id', order.id)
        .single();

      if (fetchOrderErr) throw fetchOrderErr;

      if (orderData.order_status.toLowerCase() === 'cancelled') {
        alert('Order has already been cancelled.');
        setCancelling(false);
        return;
      }

      // Check if it's cancellable (pending, confirmed, processing)
      const allowedToCancel = ['pending', 'confirmed', 'processing'].includes(orderData.order_status.toLowerCase());
      if (!allowedToCancel) {
        throw new Error('Order cannot be cancelled at this stage.');
      }

      // 2. Restore stock if inventory_adjusted is false
      if (orderData.inventory_adjusted === false) {
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('product_id, size, quantity')
          .eq('order_id', order.id);

        if (itemsErr) throw itemsErr;

        if (items && items.length > 0) {
          for (const item of items) {
            const { data: sizeData, error: sizeErr } = await supabase
              .from('product_sizes')
              .select('id, stock')
              .eq('product_id', item.product_id)
              .eq('size', item.size)
              .maybeSingle();

            if (!sizeErr && sizeData) {
              const newStock = sizeData.stock + item.quantity;
              const { error: szUpdErr } = await supabase
                .from('product_sizes')
                .update({ stock: newStock })
                .eq('id', sizeData.id);

              if (szUpdErr) throw szUpdErr;

              // Recalculate and update products.total_stock
              const { data: allSizes } = await supabase
                .from('product_sizes')
                .select('stock')
                .eq('product_id', item.product_id);

              if (allSizes) {
                const totalStock = allSizes.reduce((sum, s) => sum + s.stock, 0);
                await supabase
                  .from('products')
                  .update({ total_stock: totalStock })
                  .eq('id', item.product_id);
              }
            }
          }
        }
      }

      // 3. Update orders table status to 'cancelled' and set inventory_adjusted flag to true
      const { error: orderUpdErr } = await supabase
        .from('orders')
        .update({ 
          order_status: 'cancelled',
          inventory_adjusted: true
        })
        .eq('id', order.id);

      if (orderUpdErr) throw orderUpdErr;

      // 5. Fetch fresh order details
      const { data: updatedOrder, error: fetchErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order.id)
        .single();
      
      if (fetchErr) throw fetchErr;

      setOrder(updatedOrder);
      
      // Fetch updated status history log
      const { data: hist, error: histErr } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });
        
      if (!histErr && hist) {
        setStatusHistory(hist);
      }

      alert('Order cancelled successfully.');
    } catch (err) {
      console.error('Cancellation error details:', err);
      alert('Failed to cancel order: ' + (err.message || 'Unknown database error'));
    } finally {
      setCancelling(false);
    }
  };


  if (loading || loadingCustomer) {
    return (
      <div className="max-w-[1000px] mx-auto px-5 py-24 text-center font-sans space-y-6">
        <div className="h-4 bg-beige w-24 rounded animate-pulse" />
        <div className="h-[450px] bg-white border border-beige rounded-[3px] animate-pulse" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-[1000px] mx-auto px-5 py-20 text-center font-sans">
        <AlertTriangle className="h-10 w-10 text-accent mx-auto mb-4" />
        <h3 className="font-serif text-lg font-bold uppercase tracking-wider mb-2">Error Loading Order</h3>
        <p className="text-xs text-black/60 mb-6">{errorMsg}</p>
        <Link
          to="/account"
          className="bg-black text-white text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-accent transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const currentStageIndex = stages.findIndex(
    s => s.key.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim() === 
         order.order_status.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
  );
  const isCancelled = order.order_status.toLowerCase() === 'cancelled';
  const orderDate = new Date(order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-[1000px] mx-auto px-5 py-10 md:py-16 font-sans text-left space-y-8">
      
      {/* Back button */}
      <div>
        <Link 
          to="/account" 
          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-black/50 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to My Orders</span>
        </Link>
      </div>

      {/* Main Order Card */}
      <div className="bg-white border border-beige p-5 md:p-8 rounded-[3px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] space-y-6">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-beige pb-5">
          <div>
            <span className="text-[9px] font-bold text-accent tracking-widest uppercase">Order Tracking</span>
            <h2 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-wider text-black mt-1">
              Order #{order.order_number}
            </h2>
            <p className="text-xs text-black/50 mt-1 font-semibold uppercase tracking-wider">
              Placed on {orderDate}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs md:text-right">
            <div>
              <span className="block text-[8.5px] font-bold text-black/40 uppercase">Total Amount</span>
              <span className="block font-black text-black text-sm mt-0.5">₹{Number(order.total_amount).toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-[8.5px] font-bold text-black/40 uppercase">Payment Method</span>
              <span className="block font-bold text-black text-sm mt-0.5">{order.payment_method}</span>
            </div>
            <div>
              <span className="block text-[8.5px] font-bold text-black/40 uppercase">Items Count</span>
              <span className="block font-bold text-black text-sm mt-0.5">{orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}</span>
            </div>
            {['pending', 'confirmed', 'processing'].includes(order.order_status.toLowerCase()) && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="bg-transparent hover:bg-accent/5 border border-accent text-accent text-[9px] font-bold tracking-widest uppercase px-4 py-2 transition-all rounded-[2px] cursor-pointer disabled:opacity-50 inline-flex items-center justify-center h-9"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* CANCELLATION STATE VIEW */}
        {isCancelled ? (
          <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-[3px] space-y-2">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Order Cancelled</span>
            </h3>
            <p className="text-xs leading-relaxed">
              This order was cancelled. We have stopped order processing and initiated refunds if applicable.
            </p>
          </div>
        ) : (
          /* TIMELINE COMPONENT */
          <div className="py-4">
            
            {/* Desktop Timeline */}
            <div className="hidden md:block relative">
              {/* Horizontal Progress Track Line */}
              <div className="absolute top-4 left-[8.33%] right-[8.33%] h-[2px] bg-beige z-0">
                <div 
                  className="h-full bg-black transition-all duration-700 ease-in-out"
                  style={{
                    width: `${currentStageIndex === -1 ? 0 : (currentStageIndex / (stages.length - 1)) * 100}%`
                  }}
                />
              </div>

              {/* Steps grid */}
              <div className="grid grid-cols-6 relative z-10 text-center">
                {stages.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  
                  const StageIcon = stage.icon;
                  const logTime = getHistoryTime(stage.key);

                  return (
                    <div key={stage.key} className="flex flex-col items-center gap-2">
                      {/* Step Circle */}
                      <div 
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isCompleted ? 'bg-black border-black text-white' :
                          'bg-white border-beige text-black/35'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
                        ) : (
                          <StageIcon className="h-4 w-4" />
                        )}
                      </div>

                      {/* Labels */}
                      <div className="space-y-1 px-1">
                        <span className={`block text-[9px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                          isCompleted ? (isCurrent ? 'text-black font-black' : 'text-black font-semibold') : 
                          'text-black/35'
                        }`}>
                          {stage.label}
                        </span>
                        {logTime && (
                          <span className="block text-[8px] font-bold text-black/40 uppercase tracking-widest whitespace-nowrap">
                            {logTime}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="md:hidden space-y-6 relative pl-8 text-left">
              {/* Vertical connector line track */}
              <div className="absolute top-3 bottom-3 left-4.5 w-[2px] bg-beige z-0">
                <div 
                  className="w-full bg-black transition-all duration-700 ease-in-out"
                  style={{
                    height: `${currentStageIndex === -1 ? 0 : (currentStageIndex / (stages.length - 1)) * 100}%`
                  }}
                />
              </div>

              {/* Vertical Steps */}
              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                const StageIcon = stage.icon;
                const logTime = getHistoryTime(stage.key);

                return (
                  <div key={stage.key} className="relative flex gap-4">
                    {/* Circle icon */}
                    <div 
                      className={`absolute -left-8.5 top-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${
                        isCompleted ? 'bg-black border-black text-white' :
                        'bg-white border-beige text-black/35'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                      ) : (
                        <StageIcon className="h-3 w-3" />
                      )}
                    </div>

                    {/* Content text */}
                    <div className="pt-0.5">
                      <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted ? (isCurrent ? 'text-black font-black' : 'text-black font-semibold') :
                        'text-black/35'
                      }`}>
                        {stage.label}
                      </span>
                      {logTime && (
                        <span className="block text-[9px] font-bold text-black/40 uppercase tracking-widest mt-0.5">
                          {logTime}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        )}

      </div>

      {/* Grid: Items & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-8 items-start">
        
        {/* Left Side: Order Items */}
        <div className="bg-white border border-beige p-5 md:p-6 rounded-[3px] shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
          <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Order Items</span>
          </h3>

          <div className="divide-y divide-cream">
            {orderItems.map(item => (
              <div key={item.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-15 bg-cream border border-beige overflow-hidden shrink-0">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-black/30 uppercase">CIS</div>
                    )}
                  </div>
                  <div>
                    <span className="block font-bold text-black hover:text-accent transition-colors">{item.product_name}</span>
                    <span className="block text-[8.5px] font-bold text-black/45 mt-0.5 uppercase tracking-wider">
                      Size: {item.size} | Qty: {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-black">₹{Number(item.total_price).toLocaleString()}</span>
                  <span className="block text-[8.5px] text-black/40 mt-0.5">₹{Number(item.unit_price).toLocaleString()} each</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Layout */}
        <div className="space-y-8">
          
          {/* Shipping Address */}
          <div className="bg-white border border-beige p-5 md:p-6 rounded-[3px] shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Delivery Address</span>
            </h3>
            <div className="text-xs space-y-1 leading-relaxed">
              <p className="font-bold text-black">{order.customer_name}</p>
              <p className="text-black/60">{order.shipping_address}</p>
              <p className="text-[10px] text-black/50 font-bold uppercase tracking-wider mt-0.5">
                {order.city}, {order.state} - {order.pincode}
              </p>
              <p className="text-black/65 pt-1.5"><span className="text-black/40 font-bold uppercase text-[9px] inline-block w-12">Phone:</span> {order.customer_phone}</p>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white border border-beige p-5 md:p-6 rounded-[3px] shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-4">
              Price Summary
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-black/60">
                <span className="uppercase text-[9px] font-bold tracking-wider">Subtotal:</span>
                <span>₹{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-black/60">
                <span className="uppercase text-[9px] font-bold tracking-wider">Shipping Fee:</span>
                <span>{Number(order.shipping_charge) === 0 ? 'FREE' : `₹${Number(order.shipping_charge).toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between border-t border-beige pt-3 text-sm font-black text-black">
                <span className="uppercase text-[9.5px] tracking-wider">Total Amount:</span>
                <span>₹{Number(order.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
