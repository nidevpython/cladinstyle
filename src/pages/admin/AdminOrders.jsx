import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import { ClipboardList, Search, Eye, Filter, CheckCircle, Clock, Truck, XCircle, AlertTriangle, EyeOff, Save, Check } from 'lucide-react';
import logoFallback from '../../assets/images/clad-in-style-logo.png';

export default function AdminOrders() {
  const { showToast, storeLogoUrl } = useApp();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters / Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [previewLabelOpen, setPreviewLabelOpen] = useState(false);

  // Update Status Loading State
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setError(null);
      const { data, error: ordErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordErr) throw ordErr;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to load order records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Enable Supabase real-time updates on orders
    const ordersChannel = supabase
      .channel('orders-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Realtime orders change detected:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const statusMap = {
        'PENDING': 'pending',
        'CONFIRMED': 'confirmed',
        'PROCESSING': 'processing',
        'SHIPPED': 'shipped',
        'OUT FOR DELIVERY': 'out_for_delivery',
        'OUT_FOR_DELIVERY': 'out_for_delivery',
        'DELIVERED': 'delivered',
        'CANCELLED': 'cancelled'
      };

      const mappedStatus = statusMap[String(newStatus).toUpperCase()] || newStatus.toLowerCase();

      // 1. Fetch current order status and stock adjustment state
      const { data: orderData, error: fetchOrderErr } = await supabase
        .from('orders')
        .select('order_status, inventory_adjusted')
        .eq('id', orderId)
        .single();

      if (fetchOrderErr) throw fetchOrderErr;

      let dbError = null;

      if (mappedStatus === 'confirmed') {
        // Confirm Order and Deduct Inventory only if transitioning from pending
        const isCurrentlyPending = orderData.order_status.toLowerCase() === 'pending';
        if (isCurrentlyPending) {
          // Fetch order items to verify and deduct stock
          const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('product_id, product_name, size, quantity')
            .eq('order_id', orderId);

          if (itemsErr) throw itemsErr;

          if (items && items.length > 0) {
            // First check stock levels for all items
            for (const item of items) {
              const { data: sizeData, error: sizeErr } = await supabase
                .from('product_sizes')
                .select('stock')
                .eq('product_id', item.product_id)
                .eq('size', item.size)
                .maybeSingle();

              if (sizeErr) throw sizeErr;
              if (!sizeData) {
                throw new Error(`Size ${item.size} not configured for ${item.product_name}.`);
              }
              if (sizeData.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.product_name.trim()} - Size ${item.size}. Available: ${sizeData.stock}, Requested: ${item.quantity}.`);
              }
            }

            // Deduct stock levels and update total stock
            for (const item of items) {
              const { data: sizeData } = await supabase
                .from('product_sizes')
                .select('id, stock')
                .eq('product_id', item.product_id)
                .eq('size', item.size)
                .single();

              const newStock = sizeData.stock - item.quantity;
              const { error: szUpdErr } = await supabase
                .from('product_sizes')
                .update({ stock: newStock })
                .eq('id', sizeData.id);

              if (szUpdErr) throw szUpdErr;

              // Synchronize product aggregate total_stock
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

        // Always update status to confirmed
        const { error: updErr } = await supabase
          .from('orders')
          .update({ order_status: 'confirmed' })
          .eq('id', orderId);
        dbError = updErr;
      } else if (mappedStatus === 'cancelled') {
        // Cancel Order and Restore Stock
        if (orderData.order_status.toLowerCase() === 'cancelled') {
          // Already cancelled, do nothing
        } else if (orderData.inventory_adjusted === false) {
          // Fetch order items to restock
          const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('product_id, size, quantity')
            .eq('order_id', orderId);

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

                // Sync product total stock
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

          // Update status to cancelled and set adjusted flag to true
          const { error: updErr } = await supabase
            .from('orders')
            .update({ 
              order_status: 'cancelled',
              inventory_adjusted: true
            })
            .eq('id', orderId);
          dbError = updErr;
        } else {
          // inventory_adjusted is already true (already restocked), just update status
          const { error: updErr } = await supabase
            .from('orders')
            .update({ order_status: 'cancelled' })
            .eq('id', orderId);
          dbError = updErr;
        }
      } else {
        // Normal status changes
        const { error: updErr } = await supabase
          .from('orders')
          .update({ order_status: mappedStatus })
          .eq('id', orderId);
        dbError = updErr;
      }

      if (dbError) throw dbError;

      showToast('Order status updated');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: mappedStatus } : o));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, order_status: mappedStatus }));
      }
    } catch (err) {
      console.error('Status update failed:', err);
      showToast(err.message || 'Status update failed.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const paymentStatusMap = {
        'PENDING': 'pending',
        'PAID': 'paid',
        'FAILED': 'failed',
        'REFUNDED': 'refunded'
      };

      const mappedPaymentStatus = paymentStatusMap[String(newPaymentStatus).toUpperCase()] || newPaymentStatus.toLowerCase();

      const { error } = await supabase
        .from('orders')
        .update({ payment_status: mappedPaymentStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Supabase payment_status update error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      showToast(`Payment status updated to: ${mappedPaymentStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: mappedPaymentStatus } : o));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, payment_status: mappedPaymentStatus }));
      }
    } catch (err) {
      console.error('Payment status update failed:', err);
      showToast('Payment status update failed: ' + (err.message || 'Unknown database error'), 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openOrderDetailModal = async (order) => {
    setSelectedOrder(order);
    setOrderItems([]);
    setLoadingItems(true);

    if (order.admin_seen_at === null || order.admin_seen_at === undefined) {
      const nowString = new Date().toISOString();
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, admin_seen_at: nowString } : o));
      try {
        const { error } = await supabase
          .from('orders')
          .update({ admin_seen_at: nowString })
          .eq('id', order.id);

        if (error) {
          console.warn('Failed to update admin_seen_at in DB (column may be missing):', error.message);
        }
      } catch (err) {
        console.error('Error marking order as seen:', err);
      }
    }

    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (err) {
      console.error('Error fetching order items:', err);
      showToast('Unable to load items for this order.', 'error');
    } finally {
      setLoadingItems(false);
    }
  };

  const _getStatusBadge = (status = '') => {
    switch (String(status).toLowerCase().replace(/_/g, ' ')) {
      case 'pending':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'confirmed':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'processing':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'shipped':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'out for delivery':
        return 'text-pink-700 bg-pink-50 border-pink-200';
      case 'delivered':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-black/50 bg-cream border-beige';
      default:
        return 'text-black/60 bg-cream border-beige';
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unseenCount = orders.filter(o => o.admin_seen_at === null || o.admin_seen_at === undefined).length;

  return (
    <div className="space-y-6 text-left font-sans max-w-[1100px] mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl md:text-3xl font-black uppercase tracking-wider text-black">
            Orders
          </h1>
          {unseenCount > 0 && (
            <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-[3px] tracking-wider uppercase animate-pulse">
              {unseenCount} NEW
            </span>
          )}
        </div>
        <p className="text-xs text-black/50 mt-1 font-semibold uppercase tracking-wider">
          Track customer shopping bags, payments, delivery statuses, and cancel requests.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-beige p-4 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Search Orders</label>
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Order Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px] font-semibold"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-beige rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.015)] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-cream animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white flex items-center justify-between px-6" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs text-black/50 uppercase tracking-widest">
            {error}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-cream/45 border-b border-beige text-[9px] font-bold uppercase tracking-widest text-black/60">
                  <th className="px-6 py-4 w-32">Order Number</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4 w-28">Date</th>
                  <th className="px-6 py-4 w-28">Total Amount</th>
                  <th className="px-6 py-4 w-32">Payment Status</th>
                  <th className="px-6 py-4 w-36">Order Status</th>
                  <th className="px-6 py-4 w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {filteredOrders.map(o => {
                  const isNew = o.admin_seen_at === null || o.admin_seen_at === undefined;
                  return (
                    <tr key={o.id} className={`hover:bg-cream/10 text-xs transition-all ${isNew ? 'bg-accent/[0.02] border-l-2 border-l-accent' : ''}`}>
                      
                      {/* Order Number */}
                      <td className="px-6 py-4 font-mono font-bold text-black flex items-center gap-2 h-full">
                        <span>{o.order_number}</span>
                        {isNew && (
                          <span className="bg-accent text-white text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] tracking-wider uppercase animate-pulse">
                            NEW
                          </span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <span className="block font-bold text-black">{o.customer_name}</span>
                        <span className="block text-[10px] text-black/55 mt-0.5">{o.customer_email}</span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 font-semibold text-black/60 leading-tight">
                        <span className="block">{new Date(o.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="block text-[10px] text-black/40 font-medium mt-0.5">
                          {new Date(o.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4">
                        <span className="font-black text-black">₹{Number(o.total_amount).toLocaleString()}</span>
                        <span className="block text-[8.5px] font-bold text-black/40 mt-0.5 uppercase tracking-wider">{o.payment_method}</span>
                      </td>

                      {/* Payment Status Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={o.payment_status}
                          onChange={(e) => handleUpdatePaymentStatus(o.id, e.target.value)}
                          className={`text-[9px] font-bold tracking-wider uppercase bg-white border border-beige px-2 py-1 outline-none focus:border-black rounded-[2px]`}
                        >
                          <option value="pending">PENDING</option>
                          <option value="paid">PAID</option>
                          <option value="failed">FAILED</option>
                          <option value="refunded">REFUNDED</option>
                        </select>
                      </td>

                      {/* Order Status Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={o.order_status}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          className={`text-[9px] font-bold tracking-wider uppercase bg-white border border-beige px-2.5 py-1 outline-none focus:border-black rounded-[2px]`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Action: Open details */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openOrderDetailModal(o)}
                          className="p-1.5 border border-beige hover:border-black text-black/60 hover:text-black transition-colors rounded-[2px]"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-xs text-black/50 uppercase tracking-widest font-serif leading-loose">
            No orders found.
          </div>
        )}
      </div>

      {/* DETAIL VIEW MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-5">
          <div onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          
          <div className="relative bg-white border border-beige max-w-2xl w-full p-6 md:p-8 shadow-2xl rounded-[3px] flex flex-col max-h-[85vh] overflow-hidden animate-slideup">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-beige pb-3.5 mb-5">
              <div>
                <span className="text-[9px] font-bold text-accent tracking-widest uppercase">Order Details</span>
                <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-black mt-0.5">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-black/40 hover:text-black border border-beige p-1 rounded-[2px] transition-colors"
              >
                <EyeOff className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="overflow-y-auto pr-1 space-y-6 text-left no-scrollbar flex-grow">
              
              {/* Order Status Ribbon */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-beige p-3 rounded-[3px] bg-cream/10">
                  <span className="block text-[8px] font-bold text-black/40 uppercase mb-1">Order Status</span>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    className="w-full bg-white border border-beige px-2 py-1 text-xs font-bold uppercase outline-none focus:border-black rounded-[2px]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="border border-beige p-3 rounded-[3px] bg-cream/10">
                  <span className="block text-[8px] font-bold text-black/40 uppercase mb-1">Payment Status</span>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value)}
                    className="w-full bg-white border border-beige px-2 py-1 text-xs font-bold uppercase outline-none focus:border-black rounded-[2px]"
                  >
                    <option value="pending">PENDING</option>
                    <option value="paid">PAID</option>
                    <option value="failed">FAILED</option>
                    <option value="refunded">REFUNDED</option>
                  </select>
                </div>
              </div>

              {/* Customer and Shipping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Customer Information */}
                <div>
                  <h4 className="font-serif text-[12px] font-bold uppercase tracking-wider text-black border-b border-cream pb-1 mb-2">
                    Customer Information
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex gap-2">
                      <span className="font-bold text-black/40 w-16 uppercase text-[9px]">Name:</span>
                      <span className="text-black font-semibold">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-black/40 w-16 uppercase text-[9px]">Email:</span>
                      <span className="text-black">{selectedOrder.customer_email}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-black/40 w-16 uppercase text-[9px]">Phone:</span>
                      <span className="text-black">{selectedOrder.customer_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-serif text-[12px] font-bold uppercase tracking-wider text-black border-b border-cream pb-1 mb-2">
                    Shipping Address
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-black leading-relaxed font-medium">
                      {selectedOrder.shipping_address}
                    </p>
                    <p className="text-black/60 font-semibold uppercase text-[10px] tracking-wide">
                      {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="pt-2">
                <h4 className="font-serif text-[12px] font-bold uppercase tracking-wider text-black border-b border-cream pb-1.5 mb-3">
                  Ordered Items
                </h4>

                {loadingItems ? (
                  <div className="py-6 text-center text-xs text-black/50 animate-pulse uppercase tracking-wider">
                    Loading order items...
                  </div>
                ) : orderItems.length > 0 ? (
                  <div className="border border-cream divide-y divide-cream rounded-[2px] overflow-hidden">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 text-xs bg-cream/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12.5 bg-cream border border-beige overflow-hidden shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-black/25 uppercase">CIS</div>
                            )}
                          </div>
                          <div>
                            <span className="block font-bold text-black">{item.product_name}</span>
                            <span className="block text-[8.5px] font-bold text-black/45 mt-0.5 uppercase tracking-wider">
                              Size: {item.size} | Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-black">₹{Number(item.total_price).toLocaleString()}</span>
                          <span className="block text-[9px] text-black/40 mt-0.5">₹{Number(item.unit_price).toLocaleString()} each</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-black/50 uppercase tracking-widest">
                    No items found for this order.
                  </div>
                )}
              </div>

              {/* Pricing Breakdowns */}
              <div className="border-t border-beige pt-4 text-right flex justify-end">
                <div className="w-64 space-y-2.5 text-xs">
                  <div className="flex justify-between text-black/60">
                    <span className="uppercase text-[9px] font-bold tracking-wider">Subtotal:</span>
                    <span className="font-semibold">₹{Number(selectedOrder.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-black/60">
                    <span className="uppercase text-[9px] font-bold tracking-wider">Shipping Fee:</span>
                    <span className="font-semibold">{Number(selectedOrder.shipping_charge) === 0 ? 'FREE' : `₹${Number(selectedOrder.shipping_charge).toLocaleString()}`}</span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-accent">
                      <span className="uppercase text-[9px] font-bold tracking-wider">Discount:</span>
                      <span className="font-semibold">-₹{Number(selectedOrder.discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-black border-t border-beige pt-2 text-sm font-black">
                    <span className="uppercase text-[10px] tracking-wider">Grand Total:</span>
                    <span>₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Close footer & Actions */}
            <div className="mt-6 border-t border-beige pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setPreviewLabelOpen(true)}
                  className="bg-cream hover:bg-beige border border-beige text-black text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 transition-colors rounded-[2px]"
                >
                  View Shipping Label
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-black hover:bg-accent text-white text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 transition-colors rounded-[2px]"
                >
                  Print Shipping Label
                </button>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="border border-black/15 text-black/60 hover:text-black text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 transition-colors rounded-[2px]"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SHIPPING LABEL PREVIEW MODAL */}
      {previewLabelOpen && selectedOrder && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-5">
          <div onClick={() => setPreviewLabelOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          
          <div className="relative bg-white border border-beige max-w-md w-full p-6 shadow-2xl rounded-[3px] flex flex-col max-h-[90vh] overflow-y-auto animate-slideup text-left">
            <div className="flex justify-between items-center border-b border-beige pb-3 mb-5">
              <span className="text-[10px] font-bold text-accent tracking-widest uppercase">Shipping Label Preview</span>
              <button
                onClick={() => setPreviewLabelOpen(false)}
                className="text-black/40 hover:text-black border border-beige px-2 py-1 rounded-[2px] transition-colors text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Label Display Card */}
            <div className="bg-white border-2 border-black p-5 font-mono text-black">
              <div className="text-center border-b-2 border-black pb-3 mb-4 flex flex-col items-center">
                <img
                  src={storeLogoUrl ? `${storeLogoUrl}?t=${Date.now()}` : logoFallback}
                  alt="Clad In Style Logo"
                  className="w-24 h-auto object-contain mb-1.5"
                />
                <h1 className="text-lg font-bold tracking-widest uppercase">CLAD IN STYLE</h1>
                <span className="text-[9px] font-bold tracking-widest uppercase block">BOUTIQUE</span>
              </div>

              <div className="border-b border-black pb-4 mb-4">
                <span className="text-[9px] font-bold text-black/40 uppercase block mb-1">SHIP TO</span>
                <h2 className="text-sm font-black">{selectedOrder.customer_name}</h2>
                <p className="text-xs font-bold mt-1">Phone: {selectedOrder.customer_phone}</p>
                <p className="text-xs">Email: {selectedOrder.customer_email}</p>
                <p className="text-xs leading-relaxed mt-2 font-semibold">
                  {selectedOrder.shipping_address}
                </p>
                <p className="text-xs font-bold uppercase mt-1">
                  {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-black pb-4 mb-4 text-xs">
                <div>
                  <span className="text-[8px] font-bold text-black/40 block">ORDER NUMBER</span>
                  <span className="font-bold font-mono text-[11px]">{selectedOrder.order_number}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-black/40 block">ORDER DATE</span>
                  <span className="font-semibold text-[11px]">{new Date(selectedOrder.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-black/40 block">PAYMENT</span>
                  <span className="font-bold uppercase text-[11px]">{selectedOrder.payment_method} ({selectedOrder.payment_status})</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-black/40 block">TOTAL AMOUNT</span>
                  <span className="font-black text-[12px]">₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-[8px] font-bold text-black/40 block mb-1">ITEMS</span>
                <div className="space-y-1 text-xs">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-[11px]">{item.product_name} {item.size && `(Size: ${item.size})`}</span>
                      <span className="font-bold text-[11px]">× {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-grow bg-black hover:bg-accent text-white text-[10px] font-bold tracking-widest uppercase py-3 transition-colors rounded-[2px] text-center"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setPreviewLabelOpen(false)}
                className="flex-grow border border-black/15 text-black hover:border-black text-[10px] font-bold tracking-widest uppercase py-3 transition-colors rounded-[2px] text-center"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY SHIPPING LABEL CONTAINER */}
      {selectedOrder && (
        <div id="shipping-label-print-container">
          <div className="text-center border-b-2 border-black pb-3 mb-4 flex flex-col items-center">
            <img
              src={storeLogoUrl ? `${storeLogoUrl}?t=${Date.now()}` : logoFallback}
              alt="Clad In Style Logo"
              className="w-24 h-auto object-contain mb-1.5"
            />
            <h1 className="text-xl font-bold tracking-widest uppercase">CLAD IN STYLE</h1>
            <span className="text-[10px] font-bold tracking-widest uppercase block">BOUTIQUE</span>
          </div>

          <div className="border-b border-black pb-4 mb-4">
            <span className="text-[10px] font-bold text-black/40 uppercase block mb-1">SHIP TO</span>
            <h2 className="text-base font-black text-black">{selectedOrder.customer_name}</h2>
            <p className="text-xs font-bold mt-1">Phone: {selectedOrder.customer_phone}</p>
            <p className="text-xs">Email: {selectedOrder.customer_email}</p>
            <p className="text-xs leading-relaxed mt-2 font-semibold">
              {selectedOrder.shipping_address}
            </p>
            <p className="text-xs font-bold uppercase mt-1">
              {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-black pb-4 mb-4 text-xs">
            <div>
              <span className="text-[9px] font-bold text-black/50 block">ORDER NUMBER</span>
              <span className="font-bold font-mono">{selectedOrder.order_number}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-black/50 block">ORDER DATE</span>
              <span className="font-semibold">{new Date(selectedOrder.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-black/50 block">PAYMENT</span>
              <span className="font-bold uppercase">{selectedOrder.payment_method} ({selectedOrder.payment_status})</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-black/50 block">TOTAL AMOUNT</span>
              <span className="font-black text-sm">₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <span className="text-[9px] font-bold text-black/50 block mb-1">ITEMS</span>
            <div className="space-y-1 text-xs">
              {orderItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product_name} {item.size && `(Size: ${item.size})`}</span>
                  <span className="font-bold">× {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media screen {
          #shipping-label-print-container {
            display: none !important;
          }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #shipping-label-print-container, #shipping-label-print-container * {
            visibility: visible !important;
          }
          #shipping-label-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-sizing: border-box !important;
            display: block !important;
            border: 2px solid black !important;
            background: white !important;
            color: black !important;
            font-family: monospace !important;
          }
        }
      `}</style>

    </div>
  );
}
