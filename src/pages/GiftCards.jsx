import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Gift, Sparkles, Clock, Mail } from 'lucide-react';
import logoImg from '../assets/images/clad-in-style-logo.png';

export default function GiftCards() {
  const { addToCart, showToast } = useApp();
  
  const denominations = [500, 1000, 2000, 2500, 5000];
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const activeAmount = isCustom ? (parseFloat(customAmount) || 0) : selectedAmount;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (activeAmount < 250) {
      showToast('Minimum gift card amount is ₹250.', 'error');
      return;
    }
    if (!recipientName.trim() || !recipientEmail.trim()) {
      showToast('Please provide recipient name and email.', 'error');
      return;
    }

    setIsAdding(true);
    
    const giftCardItem = {
      id: `gift-card-${activeAmount}-${Date.now()}`,
      name: `Clad in Style E-Gift Card (₹${activeAmount.toLocaleString('en-IN')})`,
      price: activeAmount,
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      category: 'gift-cards',
      categoryName: 'Gift Cards',
      description: `Gift voucher for ${recipientName} (${recipientEmail}). Message: ${message || 'Enjoy your shopping!'}`
    };

    addToCart(giftCardItem.id, 'Digital Voucher', 'One-Size', 1, giftCardItem);
    
    setTimeout(() => {
      setIsAdding(false);
      showToast(`Added ₹${activeAmount.toLocaleString('en-IN')} Gift Card to your bag!`, 'success');
    }, 400);
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 py-10 md:py-16 text-left">
      <nav className="text-[11px] uppercase tracking-widest text-black/50 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <span className="text-black font-semibold">Gift Cards</span>
      </nav>

      <div className="border-b border-beige pb-6 mb-12">
        <div className="flex items-center gap-2.5 mb-2">
          <Gift className="w-5 h-5 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">The Perfect Gift</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-wider text-black">
          Clad In Style E-Gift Cards
        </h1>
        <p className="text-xs md:text-sm text-black/60 max-w-2xl mt-2 leading-relaxed">
          Grace in Every Stitch, Style in Every Stage. Let your loved ones pick their favorite handcrafted cord sets, maternity silhouettes, baby wear, or bespoke embroidered ensembles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="relative aspect-[1.6/1] w-full rounded-2xl bg-gradient-to-br from-black via-zinc-900 to-black p-6 md:p-8 text-white shadow-2xl flex flex-col justify-between border border-white/15 overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="max-w-[120px]">
                <img src={logoImg} alt="Clad in Style" className="w-[100px] h-auto object-contain brightness-0 invert" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-[10px] font-bold uppercase tracking-widest text-accent">
                <Sparkles className="w-3 h-3" />
                <span>E-Gift Card</span>
              </div>
            </div>

            <div className="relative z-10 my-4">
              <span className="block text-[10px] font-medium tracking-widest uppercase text-white/60">Voucher Value</span>
              <div className="font-serif text-3xl md:text-4xl font-black tracking-tight text-white mt-1">
                ₹{activeAmount > 0 ? activeAmount.toLocaleString('en-IN') : '0'}
              </div>
            </div>

            <div className="relative z-10 flex justify-between items-end border-t border-white/15 pt-4 text-[10px] text-white/70">
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-white/40">For</span>
                <span className="font-semibold text-white tracking-wide truncate max-w-[160px] block">
                  {recipientName.trim() || 'Valued Recipient'}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] uppercase tracking-wider text-white/40">Valid Period</span>
                <span className="font-medium text-white/90">12 Months</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-cream/50 border border-beige rounded-sm flex items-start gap-3">
              <Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-black">Instant Delivery</h4>
                <p className="text-[10px] text-black/60 mt-0.5 leading-relaxed">Delivered directly to recipient’s inbox with your personalized note.</p>
              </div>
            </div>
            <div className="p-4 bg-cream/50 border border-beige rounded-sm flex items-start gap-3">
              <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-black">1 Year Validity</h4>
                <p className="text-[10px] text-black/60 mt-0.5 leading-relaxed">Can be used across multiple orders until balance is exhausted.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-beige p-6 md:p-8 rounded-sm shadow-sm">
          <form onSubmit={handleAddToCart} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-3">
                1. Select Denomination Amount
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {denominations.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setIsCustom(false);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 px-3 text-xs font-bold transition-all border rounded-sm ${
                      !isCustom && selectedAmount === amt
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-cream/40 text-black/80 border-beige hover:border-black'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="custom-toggle"
                    name="amount-toggle"
                    checked={isCustom}
                    onChange={() => setIsCustom(true)}
                    className="accent-black cursor-pointer"
                  />
                  <label htmlFor="custom-toggle" className="text-xs font-medium text-black/70 cursor-pointer">
                    Enter Custom Value (Min ₹250)
                  </label>
                </div>
                {isCustom && (
                  <div className="mt-2 relative max-w-xs">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-black/50">₹</span>
                    <input
                      type="number"
                      min="250"
                      max="50000"
                      step="50"
                      placeholder="e.g. 3500"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-cream/20 border border-beige text-xs font-bold outline-none focus:border-black rounded-sm"
                      required={isCustom}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-beige pt-6 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-black">
                2. Recipient Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/60 mb-1.5">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient's Name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream/20 border border-beige text-xs outline-none focus:border-black rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/60 mb-1.5">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="recipient@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream/20 border border-beige text-xs outline-none focus:border-black rounded-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-beige pt-6 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-black">
                3. Personalize Your Gift
              </label>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black/60 mb-1.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Sender's Name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream/20 border border-beige text-xs outline-none focus:border-black rounded-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black/60 mb-1.5">
                  Greeting Message (Optional)
                </label>
                <textarea
                  rows="3"
                  maxLength="250"
                  placeholder="Wishing you joy, comfort, and timeless style with Clad in Style..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream/20 border border-beige text-xs outline-none focus:border-black rounded-sm resize-none"
                />
                <span className="block text-[9px] text-black/40 text-right mt-1">{250 - message.length} characters left</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-black text-white text-xs font-bold tracking-widest uppercase py-4 px-6 hover:bg-accent transition-colors flex items-center justify-center gap-2 rounded-sm cursor-pointer disabled:opacity-60"
              >
                <Gift className="w-4 h-4" />
                <span>{isAdding ? 'Adding to Bag...' : `Add ₹${activeAmount.toLocaleString('en-IN')} Gift Card to Bag`}</span>
              </button>
              <p className="text-[10px] text-center text-black/50 mt-3">
                No expiry fees. Redeemable online at checkout across all collections.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
