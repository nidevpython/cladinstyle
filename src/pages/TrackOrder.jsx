import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Search, Package, Truck, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';

export default function TrackOrder() {
  const [orderQuery, setOrderQuery] = useState('');
  const [emailQuery, setEmailQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const steps = [
    { key: 'pending', label: 'Order Placed', desc: 'Received & awaiting review' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Order verified & tailoring begins' },
    { key: 'processing', label: 'Processing', desc: 'Quality checked & packed with care' },
    { key: 'shipped', label: 'Shipped', desc: 'Handed to courier partner' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Arriving today at your address' },
    { key: 'delivered', label: 'Delivered', desc: 'Delivered successfully' }
  ];

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSearched(true);
    setOrderData(null);

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .ilike('order_number', orderQuery.trim());

      if (emailQuery.trim()) {
        query = query.ilike('customer_email', emailQuery.trim());
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMsg(`No order record found for "${orderQuery.trim()}". Please verify the order number or check your confirmation email.`);
      } else {
        setOrderData(data);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setErrorMsg('Unable to retrieve tracking details at this moment. Please try again or reach our team via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const getActiveStepIndex = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'cancelled') return -1;
    const idx = steps.findIndex(st => st.key === s);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = orderData ? getActiveStepIndex(orderData.order_status) : -1;

  return (
    <div className="max-w-[1320px] mx-auto px-5 py-10 md:py-16 text-left">
      <nav className="text-[11px] uppercase tracking-widest text-black/50 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <span className="text-black font-semibold">Track Order</span>
      </nav>

      <div className="border-b border-beige pb-6 mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <Truck className="w-5 h-5 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Real-time Order Status</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-wider text-black">
          Track Your Order
        </h1>
        <p className="text-xs md:text-sm text-black/60 max-w-xl mt-2 leading-relaxed">
          Enter your order reference number (e.g. CLAD-2026-XXXXXX) from your confirmation email or SMS to track shipping and delivery progress.
        </p>
      </div>

      <div className="max-w-2xl bg-white border border-beige p-6 md:p-8 rounded-sm shadow-sm mb-12">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black/70 mb-1.5">
                Order Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="CLAD-2026-199695"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full px-3.5 py-3 bg-cream/20 border border-beige text-xs font-mono font-bold outline-none focus:border-black rounded-sm uppercase placeholder:normal-case"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black/70 mb-1.5">
                Billing Email (Optional)
              </label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={emailQuery}
                onChange={(e) => setEmailQuery(e.target.value)}
                className="w-full px-3.5 py-3 bg-cream/20 border border-beige text-xs outline-none focus:border-black rounded-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-black text-white text-xs font-bold tracking-widest uppercase py-3.5 px-8 hover:bg-accent transition-colors flex items-center justify-center gap-2 rounded-sm cursor-pointer disabled:opacity-60"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Track Package'}</span>
          </button>
        </form>
      </div>

      {/* Results Section */}
      {searched && (
        <div>
          {errorMsg ? (
            <div className="p-6 bg-red-50/60 border border-red-200 text-red-800 text-xs rounded-sm flex items-start gap-3 max-w-2xl">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <strong className="block font-bold uppercase tracking-wider mb-1">Order Lookup Notice</strong>
                <p className="leading-relaxed">{errorMsg}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Link to="/contact" className="underline font-semibold hover:text-black">Contact Boutique Support</Link>
                  <span>•</span>
                  <a href="https://wa.me/919840012345" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-black">WhatsApp Us</a>
                </div>
              </div>
            </div>
          ) : orderData ? (
            <div className="space-y-8 max-w-4xl bg-white border border-beige p-6 md:p-10 rounded-sm shadow-sm">
              
              {/* Top Order Status Banner */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-beige gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">Order Reference</span>
                  <h3 className="font-serif text-2xl font-bold text-black mt-0.5">{orderData.order_number}</h3>
                  <span className="text-[11px] text-black/60">
                    Placed on {new Date(orderData.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">Current Status</span>
                  <div className="mt-1">
                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${
                      orderData.order_status === 'cancelled'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : orderData.order_status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-accent/15 text-black border border-accent/30'
                    }`}>
                      {orderData.order_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Steps (if not cancelled) */}
              {orderData.order_status !== 'cancelled' ? (
                <div className="py-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-6">Fulfillment Journey</h4>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
                    {steps.map((st, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={st.key} className="flex md:flex-col items-start gap-3 md:gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isCompleted ? 'bg-black text-white' : 'bg-cream text-black/40 border border-beige'
                          } ${isCurrent ? 'ring-4 ring-accent/30 bg-accent text-white' : ''}`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div>
                            <span className={`block text-xs font-bold uppercase tracking-wider ${
                              isCurrent ? 'text-black' : isCompleted ? 'text-black/80' : 'text-black/40'
                            }`}>
                              {st.label}
                            </span>
                            <span className="block text-[10px] text-black/50 leading-tight mt-0.5">
                              {st.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                  This order was marked as cancelled. Any payments processed are automatically refunded according to our Return & Refund timelines.
                </div>
              )}

              {/* Delivery Details */}
              <div className="border-t border-beige pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-cream/40 border border-beige rounded-sm">
                  <div className="flex items-center gap-2 mb-2 text-black font-bold uppercase tracking-wider text-[11px]">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span>Shipping Destination</span>
                  </div>
                  <p className="font-semibold text-black">{orderData.customer_name}</p>
                  <p className="text-black/70 mt-1 leading-relaxed">
                    {orderData.shipping_address}<br />
                    {orderData.city}, {orderData.state} - {orderData.pincode}
                  </p>
                </div>

                <div className="p-4 bg-cream/40 border border-beige rounded-sm">
                  <div className="flex items-center gap-2 mb-2 text-black font-bold uppercase tracking-wider text-[11px]">
                    <Package className="w-4 h-4 text-accent" />
                    <span>Payment & Summary</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-beige/60">
                    <span className="text-black/60">Payment Method:</span>
                    <span className="font-bold text-black uppercase">{orderData.payment_method}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-beige/60">
                    <span className="text-black/60">Payment Status:</span>
                    <span className="font-bold text-black uppercase">{orderData.payment_status}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-black">
                    <span>Order Total:</span>
                    <span>₹{parseFloat(orderData.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
