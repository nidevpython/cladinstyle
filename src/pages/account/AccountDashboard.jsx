import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../supabase';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShoppingBag, Settings, LogOut, Key, AlertCircle, Check, Eye, EyeOff, Calendar, Phone, Mail } from 'lucide-react';

export default function AccountDashboard() {
  const { customer, customerProfile, setCustomerProfile, loadingCustomer, showToast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // orders, profile, password

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Profile Form State
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [phone, setPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loadingCustomer && !customer) {
      navigate('/account/login');
    }
  }, [customer, loadingCustomer, navigate]);

  // Load Profile inputs when profile updates
  useEffect(() => {
    if (customerProfile) {
      setFname(customerProfile.first_name || '');
      setLname(customerProfile.last_name || '');
      setPhone(customerProfile.phone || '');
    } else if (customer) {
      // Fallback to auth metadata if profile record doesn't exist yet
      setFname(customer.user_metadata?.first_name || '');
      setLname(customer.user_metadata?.last_name || '');
      setPhone(customer.user_metadata?.phone || '');
    }
  }, [customerProfile, customer]);

  // Fetch Customer orders with item count mappings and realtime subscription
  useEffect(() => {
    let ordersChannel;

    if (customer) {
      const fetchCustomerOrders = async () => {
        try {
          setLoadingOrders(true);
          setOrdersError(null);

          const { data: orderList, error: orderErr } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', customer.id)
            .order('created_at', { ascending: false });

          if (orderErr) {
            console.error('order fetch error:', orderErr);
            throw orderErr;
          }

          let itemsList = [];
          if (orderList && orderList.length > 0) {
            const orderIds = orderList.map(o => o.id);
            const { data: items, error: itemsErr } = await supabase
              .from('order_items')
              .select('order_id, quantity')
              .in('order_id', orderIds);

            if (itemsErr) {
              console.error('order items fetch error:', itemsErr);
            } else {
              itemsList = items || [];
            }
          }

          const mappedOrders = (orderList || []).map(o => {
            const qtySum = itemsList
              .filter(i => i.order_id === o.id)
              .reduce((sum, item) => sum + (item.quantity || 0), 0);
            return {
              ...o,
              item_count: qtySum
            };
          });

          setOrders(mappedOrders);
        } catch (err) {
          console.error('Failed fetching orders:', err);
          setOrdersError('Unable to load your orders. Please try again.');
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchCustomerOrders();

      // Realtime listener for order updates
      ordersChannel = supabase
        .channel(`customer-orders-realtime-${customer.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${customer.id}`
          },
          (payload) => {
            console.log('Realtime change detected for customer order:', payload);
            fetchCustomerOrders();
          }
        )
        .subscribe();
    }

    return () => {
      if (ordersChannel) {
        supabase.removeChannel(ordersChannel);
      }
    };
  }, [customer]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fname || !lname || !phone) {
      showToast('Please fill in all profile fields.', 'error');
      return;
    }

    setUpdatingProfile(true);
    try {
      // Upsert profile details
      const profilePayload = {
        id: customer.id,
        first_name: fname,
        last_name: lname,
        email: customer.email,
        phone: phone,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('customer_profiles')
        .upsert(profilePayload)
        .select()
        .single();

      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('cache')) {
          throw new Error('Unable to save your profile. The profile service is temporarily offline.');
        } else {
          throw error;
        }
      }

      setCustomerProfile(data);
      showToast('Profile updated successfully.');
    } catch (err) {
      console.error('Profile update failed:', err);
      showToast(err.message || 'Unable to update your profile. Please try again.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    setPasswordError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showToast('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err.message || 'Unable to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showToast('Signed out successfully.');
      navigate('/');
    } catch (err) {
      showToast('Logout failed: ' + err.message, 'error');
    }
  };

  const openOrderDetails = async (order) => {
    setSelectedOrder(order);
    setSelectedOrderItems([]);
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (error) throw error;
      setSelectedOrderItems(data || []);
    } catch (err) {
      console.error('Error fetching order items:', err);
      showToast('Unable to load items for this order.', 'error');
    } finally {
      setLoadingItems(false);
    }
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Confirmed': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Processing': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Shipped': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Delivered': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-black/40 bg-cream border-beige';
    }
  };

  if (loadingCustomer || !customer) {
    return (
      <div className="max-w-[1320px] mx-auto px-5 py-24 text-center font-sans">
        <div className="h-8 bg-beige w-32 mx-auto rounded animate-pulse" />
        <div className="max-w-md mx-auto h-[250px] bg-white border border-beige mt-6 animate-pulse rounded-[3px]" />
      </div>
    );
  }

  const creationDate = customer.created_at
    ? new Date(customer.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })
    : 'N/A';

  const getCustomerDisplayName = () => {
    if (customerProfile?.first_name || customerProfile?.last_name) {
      return `${customerProfile.first_name || ''} ${customerProfile.last_name || ''}`.trim();
    }
    if (customer?.user_metadata?.first_name || customer?.user_metadata?.last_name) {
      return `${customer.user_metadata.first_name || ''} ${customer.user_metadata.last_name || ''}`.trim();
    }
    if (customer?.email) {
      const emailPart = customer.email.split('@')[0];
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    return 'Valued Customer';
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 py-10 md:py-16 font-sans text-left">
      
      {/* Welcome Banner */}
      <div className="bg-cream border border-beige p-6 md:p-8 rounded-[3px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-[9px] font-bold text-accent tracking-widest uppercase">My Account</span>
          <h2 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-wider text-black mt-1">
            Hello, {getCustomerDisplayName()}
          </h2>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-black/60">
            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>
            {phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {phone}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Registered: {creationDate}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-black text-white hover:bg-accent text-[9px] font-bold tracking-widest uppercase px-5 py-2.5 transition-colors rounded-[2px] inline-flex items-center gap-1.5 shrink-0"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 items-start">
        
        {/* Navigation Sidebar Drawer */}
        <div className="flex flex-row lg:flex-col border-b lg:border-b-0 lg:border-r border-beige pb-4 lg:pb-0 lg:pr-6 gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2.5 text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-[2px] transition-all whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-cream/40 text-black/60'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>My Orders</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-[2px] transition-all whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-cream/40 text-black/60'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Details</span>
          </button>
          
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2.5 text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-[2px] transition-all whitespace-nowrap ${
              activeTab === 'password' ? 'bg-black text-white' : 'hover:bg-cream/40 text-black/60'
            }`}
          >
            <Key className="h-4 w-4" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-grow min-w-0">
          
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3">
                Order History
              </h3>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-black/50 animate-pulse uppercase tracking-wider font-semibold">
                  Loading your orders...
                </div>
              ) : ordersError ? (
                <div className="p-4 bg-accent/5 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider text-center">
                  {ordersError}
                </div>
              ) : orders.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-beige p-5 rounded-[3px] bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-sm transition-all text-left">
                      <div className="space-y-1">
                        <span className="block font-mono font-bold text-black text-[13.5px]">{order.order_number}</span>
                        <span className="block text-[10px] text-black/45 uppercase tracking-wider">
                          {new Date(order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="block text-[10px] text-black/60 font-bold uppercase tracking-wider pt-0.5">
                          {order.item_count} {order.item_count === 1 ? 'Item' : 'Items'} | {order.payment_method}
                        </span>
                      </div>
                      
                      <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 border-t sm:border-t-0 border-cream pt-3 sm:pt-0 shrink-0">
                        <div className="flex sm:flex-col items-center sm:items-end gap-1.5 sm:gap-0.5">
                          <span className="block text-[9px] font-bold text-black/40 uppercase tracking-wider">Total Amount:</span>
                          <span className="block text-xs font-black text-black">₹{Number(order.total_amount).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex flex-col items-start sm:items-end">
                            <span className="text-[8px] text-black/35 font-bold uppercase tracking-widest">Order Status</span>
                            <span className={`text-[8.5px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-[2px] mt-0.5 ${getOrderStatusClass(order.order_status)}`}>
                              {order.order_status}
                            </span>
                          </div>
                          <Link
                            to={`/account/orders/${order.id}`}
                            className="bg-black hover:bg-accent text-white text-[9px] font-bold tracking-widest uppercase px-3.5 py-2.5 transition-colors rounded-[2px] inline-block text-center"
                          >
                            View Order
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-black/50 uppercase tracking-widest font-serif leading-loose border border-beige bg-cream/10 rounded-[3px]">
                  You haven't placed any orders yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3">
                Profile Details
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fname" className="text-[9px] font-bold uppercase tracking-wider text-black/60">First Name *</label>
                    <input
                      type="text"
                      id="fname"
                      required
                      value={fname}
                      onChange={(e) => setFname(e.target.value)}
                      className="border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="lname" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Last Name *</label>
                    <input
                      type="text"
                      id="lname"
                      required
                      value={lname}
                      onChange={(e) => setLname(e.target.value)}
                      className="border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Email Address (Display Only)</label>
                  <input
                    type="email"
                    id="email"
                    disabled
                    value={customer.email}
                    className="border border-beige text-xs py-2.5 px-3.5 outline-none bg-cream/40 text-black/45 rounded-[2px]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="bg-black text-white text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-accent transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 rounded-[2px]"
                >
                  {updatingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PASSWORD RESET */}
          {activeTab === 'password' && (
            <div className="space-y-4 max-w-md">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3">
                Update Password
              </h3>

              {passwordError && (
                <div className="p-3 bg-accent/5 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="npass" className="text-[9px] font-bold uppercase tracking-wider text-black/60">New Password (min 8 chars) *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="npass"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-beige text-xs py-2.5 pl-3.5 pr-10 outline-none focus:border-black rounded-[2px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-black/40 hover:text-black"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cnpass" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Confirm New Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="cnpass"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="bg-black text-white text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-accent transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 rounded-[2px]"
                >
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* DETAILED ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-5">
          <div onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
          
          <div className="relative bg-white border border-beige max-w-2xl w-full p-6 md:p-8 shadow-2xl rounded-[3px] flex flex-col max-h-[85vh] overflow-hidden animate-slideup">
            
            <div className="flex justify-between items-center border-b border-beige pb-3.5 mb-5">
              <div>
                <span className="text-[9px] font-bold text-accent tracking-widest uppercase">My Order Details</span>
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

            <div className="overflow-y-auto pr-1 space-y-6 text-left no-scrollbar flex-grow">
              
              {/* Status Header */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-beige p-3.5 rounded-[3px] bg-cream/10 flex justify-between items-center">
                  <div>
                    <span className="block text-[8.5px] font-bold text-black/45 uppercase">Order Status</span>
                    <span className="block text-xs font-black text-black mt-0.5">{selectedOrder.order_status}</span>
                  </div>
                  <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-[2px] ${getOrderStatusClass(selectedOrder.order_status)}`}>
                    {selectedOrder.order_status}
                  </span>
                </div>
                
                <div className="border border-beige p-3.5 rounded-[3px] bg-cream/10 flex justify-between items-center">
                  <div>
                    <span className="block text-[8.5px] font-bold text-black/45 uppercase">Payment status</span>
                    <span className="block text-xs font-black text-black mt-0.5">{selectedOrder.payment_status}</span>
                  </div>
                  <span className="text-[8px] font-bold tracking-widest uppercase text-black/50">{selectedOrder.payment_method}</span>
                </div>
              </div>

              {/* Delivery and Date Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div>
                  <h4 className="font-serif text-[11px] font-bold uppercase tracking-wider text-black border-b border-cream pb-1 mb-2">
                    Shipping Details
                  </h4>
                  <p className="text-xs text-black leading-relaxed font-semibold">
                    {selectedOrder.customer_name}
                  </p>
                  <p className="text-xs text-black/60 leading-relaxed mt-1">
                    {selectedOrder.shipping_address}
                  </p>
                  <p className="text-[10px] text-black/50 font-bold uppercase tracking-wider mt-0.5">
                    {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                  </p>
                </div>

                <div>
                  <h4 className="font-serif text-[11px] font-bold uppercase tracking-wider text-black border-b border-cream pb-1 mb-2">
                    Date & Contact
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-black/40 font-bold uppercase text-[9px] w-12 inline-block">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                    <p><span className="text-black/40 font-bold uppercase text-[9px] w-12 inline-block">Phone:</span> {selectedOrder.customer_phone}</p>
                    <p><span className="text-black/40 font-bold uppercase text-[9px] w-12 inline-block">Email:</span> {selectedOrder.customer_email}</p>
                  </div>
                </div>
              </div>

              {/* Items details */}
              <div>
                <h4 className="font-serif text-[11px] font-bold uppercase tracking-wider text-black border-b border-cream pb-1.5 mb-3">
                  Items Snapshot
                </h4>

                {loadingItems ? (
                  <div className="py-6 text-center text-xs text-black/50 animate-pulse uppercase tracking-wider">
                    Loading items...
                  </div>
                ) : selectedOrderItems.length > 0 ? (
                  <div className="border border-cream divide-y divide-cream rounded-[2px] overflow-hidden">
                    {selectedOrderItems.map(item => (
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
                          <span className="block text-[8.5px] text-black/40 mt-0.5">₹{Number(item.unit_price).toLocaleString()} each</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-black/50 uppercase tracking-widest">
                    No items found.
                  </div>
                )}
              </div>

              {/* pricing */}
              <div className="border-t border-beige pt-4 flex justify-end text-right">
                <div className="w-60 space-y-2 text-xs">
                  <div className="flex justify-between text-black/60">
                    <span className="uppercase text-[9px] font-bold tracking-wider">Subtotal:</span>
                    <span>₹{Number(selectedOrder.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-black/60">
                    <span className="uppercase text-[9px] font-bold tracking-wider">Shipping Fee:</span>
                    <span>{Number(selectedOrder.shipping_charge) === 0 ? 'FREE' : `₹${Number(selectedOrder.shipping_charge).toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between border-t border-beige pt-2 text-sm font-black text-black">
                    <span className="uppercase text-[9.5px] tracking-wider">Grand Total:</span>
                    <span>₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 border-t border-beige pt-4 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-black text-white text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-accent transition-colors rounded-[2px]"
              >
                Close details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
