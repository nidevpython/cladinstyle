import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabase';
import { CreditCard, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { cart, getCartSubtotal, clearCart, customer, customerProfile } = useApp();
  const navigate = useNavigate();

  // Auto-fill user details if logged in
  React.useEffect(() => {
    if (customer) {
      setEmail(customer.email || '');
    }
    if (customerProfile) {
      setFname(customerProfile.first_name || '');
      setLname(customerProfile.last_name || '');
      setPhone(customerProfile.phone || '');
    } else if (customer?.user_metadata) {
      setFname(customer.user_metadata.first_name || '');
      setLname(customer.user_metadata.last_name || '');
      setPhone(customer.user_metadata.phone || '');
    }
  }, [customer, customerProfile]);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
  const [paymethod, setPaymethod] = useState('cod'); // cod, card, upi, net
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = getCartSubtotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Generate unique order number
      const orderNum = `CLAD-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      // 2. Map data
      const customerName = `${fname} ${lname}`.trim();
      const shippingAddress = address;

      const orderPayload = {
        order_number: orderNum,
        customer_name: customerName,
        customer_email: email,
        customer_phone: phone,
        shipping_address: shippingAddress,
        city,
        state,
        pincode: zip,
        subtotal: parseFloat(subtotal),
        shipping_charge: parseFloat(shipping),
        discount: 0.00,
        total_amount: parseFloat(total),
        payment_method: paymethod.toUpperCase(),
        payment_status: paymethod === 'cod' ? 'pending' : 'paid',
        order_status: 'pending',
        user_id: customer ? customer.id : null
      };

      // 3. Insert order
      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('id')
        .single();

      if (orderErr) {
        console.error('Order table insert error:', orderErr);
        throw new Error('Order creation failed: ' + (orderErr.message || 'Please try again.'));
      }

      const orderIdDb = newOrder.id;
      // 4. Map items
      const itemsPayload = cart.map(item => ({
        order_id: orderIdDb,
        product_id: item.id ? parseInt(item.id) : null,
        product_name: item.name,
        product_image: item.image,
        size: item.size,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        total_price: parseFloat(item.price * item.quantity)
      }));

      // 5. Insert order items
      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(itemsPayload);

      if (itemsErr) {
        console.error('Order items table insert error:', itemsErr);
        // Transaction safety: Clean up parent order if items fail
        await supabase.from('orders').delete().eq('id', orderIdDb);
        throw new Error('Unable to save order items: ' + (itemsErr.message || 'Please try again.'));
      }

      setOrderId(orderNum);
      setIsOrdered(true);
      clearCart();
    } catch (err) {
      console.error('Checkout error details:', err);
      setErrorMsg(err.message || 'Unable to place your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="max-w-[1320px] mx-auto px-5 py-20 flex flex-col items-center">
        <style>{`
          @keyframes checkmarkEntrance {
            0% {
              opacity: 0;
              transform: translateY(-40px) rotateY(0deg) scale(0.75);
              box-shadow: 0 0 0 rgba(0, 0, 0, 0);
            }
            21% {
              opacity: 1;
              transform: translateY(-15px) rotateY(360deg) scale(0.9);
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            }
            53% {
              transform: translateY(5px) rotateY(540deg) scale(1.05);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
            }
            78% {
              transform: translateY(0) rotateY(720deg) scale(1.02);
              box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
            }
            100% {
              opacity: 1;
              transform: translateY(0) rotateY(720deg) scale(1);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
          }

          @keyframes checkmarkEntranceReduced {
            0% {
              opacity: 0;
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-checkmark {
            animation: checkmarkEntrance 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            perspective: 1000px;
            backface-visibility: visible;
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-checkmark {
              animation: checkmarkEntranceReduced 0.6s ease-out forwards;
            }
          }
        `}</style>
        <div className="max-w-[500px] w-full flex flex-col items-center gap-5 text-center">
          
          <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center shadow-md animate-checkmark">
            <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>

          <div className="mt-2.5">
            <h2 className="font-serif text-2xl font-bold uppercase tracking-wide">Order Confirmed</h2>
            <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest mt-1">
              Thank you for shopping at Clad in Style Boutique
            </p>
          </div>

          <div className="border border-beige bg-cream p-5 text-left text-xs w-full flex flex-col gap-2.5">
            <div className="flex justify-between border-b border-beige pb-2">
              <span className="font-bold text-black/50 uppercase">Order Number</span>
              <span className="font-bold text-black">{orderId}</span>
            </div>
            <div className="flex justify-between border-b border-beige pb-2">
              <span className="font-bold text-black/50 uppercase">Delivery Method</span>
              <span className="font-bold text-black">Standard Shipping</span>
            </div>
            <div className="flex justify-between border-b border-beige pb-2">
              <span className="font-bold text-black/50 uppercase">Payment Mode</span>
              <span className="font-bold text-black uppercase">{paymethod}</span>
            </div>
            <p className="text-[10px] text-black/50 leading-relaxed mt-2">
              An order confirmation receipt has been dispatched to <strong className="text-black">{email}</strong>. Your items will pack and ship from our studio within 24 hours.
            </p>
          </div>

          <Link to="/" className="mt-4 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-8 py-3.5 hover:bg-accent transition-colors">
            Continue Shopping
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-5 pt-5 pb-20">
      
      {/* Header */}
      <div className="border-b border-beige pb-2.5 mb-8 text-left">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wider">Checkout</h2>
        <p className="text-[11px] text-black/50 font-medium mt-0.5">
          Complete your contact, shipping, and billing details.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-lg mb-4 text-black/55">Your bag is empty.</p>
          <Link to="/" className="inline-block bg-black text-white text-xs font-bold tracking-widest uppercase px-6 py-3 hover:bg-accent transition-colors">
            Shop Catalog
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 text-left items-start">
          
          {/* Left Fields */}
          <div className="flex flex-col gap-8">
            
            {!customer && (
              <div className="p-4 bg-cream border border-beige text-left text-xs flex justify-between items-center rounded-[2px]">
                <div>
                  <span className="font-bold text-black uppercase tracking-wider block">Already have an account?</span>
                  <span className="text-[10px] text-black/50 mt-0.5 block uppercase tracking-wide">Login to check out faster</span>
                </div>
                <Link to="/account/login" className="border border-black text-black hover:bg-black hover:text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2 transition-all rounded-[2px]">
                  Sign In
                </Link>
              </div>
            )}

            {/* Contact Info */}
            <div>
              <h3 className="font-serif text-[14px] font-bold uppercase tracking-widest border-b border-beige pb-1.5 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    placeholder="yourname@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3 outline-none focus:border-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Phone Number *</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    required 
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h3 className="font-serif text-[14px] font-bold uppercase tracking-widest border-b border-beige pb-1.5 mb-4">
                Delivery Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fname" className="text-[9px] font-bold uppercase tracking-wider text-black/60">First Name *</label>
                  <input 
                    type="text" 
                    id="fname" 
                    required 
                    placeholder="First name"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3 outline-none focus:border-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lname" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Last Name *</label>
                  <input 
                    type="text" 
                    id="lname" 
                    required 
                    placeholder="Last name"
                    value={lname}
                    onChange={(e) => setLname(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3 outline-none focus:border-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="address" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Street Address *</label>
                  <input 
                    type="text" 
                    id="address" 
                    required 
                    placeholder="Apartment, suite, street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3 outline-none focus:border-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="city" className="text-[9px] font-bold uppercase tracking-wider text-black/60">City *</label>
                  <input 
                    type="text" 
                    id="city" 
                    required 
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3 outline-none focus:border-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="state" className="text-[9px] font-bold uppercase tracking-wider text-black/60">State *</label>
                  <input 
                    type="text" 
                    id="state" 
                    required 
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3 outline-none focus:border-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="zip" className="text-[9px] font-bold uppercase tracking-wider text-black/60">ZIP / PIN Code *</label>
                  <input 
                    type="text" 
                    id="zip" 
                    required 
                    maxLength={6}
                    placeholder="6-digit code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Choice */}
            <div>
              <h3 className="font-serif text-[14px] font-bold uppercase tracking-widest border-b border-beige pb-1.5 mb-4">
                Payment Method
              </h3>
              <div className="flex flex-col gap-3">
                
                <label className={`flex items-center gap-3 border p-3.5 cursor-pointer bg-white transition-all ${
                  paymethod === 'cod' ? 'bg-cream border-black' : 'border-beige'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    checked={paymethod === 'cod'} 
                    onChange={() => setPaymethod('cod')}
                    className="accent-black" 
                  />
                  <div className="flex-grow flex justify-between items-center text-xs font-bold">
                    <span>Cash On Delivery (COD)</span>
                    <span className="text-[8px] font-semibold text-black/40 uppercase tracking-wide">Active</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 border p-3.5 cursor-pointer bg-white transition-all ${
                  paymethod === 'card' ? 'bg-cream border-black' : 'border-beige'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card" 
                    checked={paymethod === 'card'} 
                    onChange={() => setPaymethod('card')}
                    className="accent-black" 
                  />
                  <div className="flex-grow flex justify-between items-center text-xs font-bold">
                    <span>Credit / Debit Card</span>
                    <span className="text-[8px] font-semibold text-black/40 uppercase tracking-wide">Visa, Mastercard</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 border p-3.5 cursor-pointer bg-white transition-all ${
                  paymethod === 'upi' ? 'bg-cream border-black' : 'border-beige'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="upi" 
                    checked={paymethod === 'upi'} 
                    onChange={() => setPaymethod('upi')}
                    className="accent-black" 
                  />
                  <div className="flex-grow flex justify-between items-center text-xs font-bold">
                    <span>UPI Instant Scan</span>
                    <span className="text-[8px] font-semibold text-black/40 uppercase tracking-wide">GPay, PhonePe</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 border p-3.5 cursor-pointer bg-white transition-all ${
                  paymethod === 'net' ? 'bg-cream border-black' : 'border-beige'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="net" 
                    checked={paymethod === 'net'} 
                    onChange={() => setPaymethod('net')}
                    className="accent-black" 
                  />
                  <div className="flex-grow flex justify-between items-center text-xs font-bold">
                    <span>Net Banking</span>
                    <span className="text-[8px] font-semibold text-black/40 uppercase tracking-wide">All Indian Banks</span>
                  </div>
                </label>

              </div>
            </div>

          </div>

          {/* Right Summary Block */}
          <div>
            <div className="border border-beige bg-cream p-6">
              <h3 className="font-serif text-[14px] font-bold uppercase tracking-widest mb-4">
                Order Summary
              </h3>

              {/* Items List */}
              <div className="max-h-[240px] overflow-y-auto flex flex-col gap-3 pb-4 mb-4 border-b border-beige no-scrollbar">
                {cart.map(item => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 text-xs">
                    <div className="w-12 aspect-[4/5] border border-beige bg-white overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="text-left">
                        <h4 className="font-bold line-clamp-1 leading-tight">{item.name}</h4>
                        <span className="text-[8px] text-black/50 uppercase">Qty: {item.quantity} | Size: {item.size}</span>
                      </div>
                      <span className="font-bold text-right">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations list */}
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between text-black/80">
                  <span>Cart Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-black/80">
                  <span>Shipping Fee</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-black border-t border-beige pt-4 mt-1.5">
                  <span>Estimated Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 bg-accent/5 border border-accent/20 text-accent text-[9.5px] font-bold uppercase tracking-wider text-center">
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || cart.length === 0}
                className="w-full bg-black text-white text-[10px] font-bold tracking-widest uppercase py-3.5 mt-5 hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order →'}
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
