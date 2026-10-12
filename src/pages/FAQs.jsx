import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, Sparkles, MessageCircle } from 'lucide-react';

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const faqData = [
    {
      category: 'orders',
      q: 'What payment methods do you accept?',
      a: 'We accept major Indian debit/credit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) across all serviceable pin codes.'
    },
    {
      category: 'orders',
      q: 'Can I modify or cancel my order after placing it?',
      a: 'Yes, orders can be modified or cancelled within 2 hours of placement before our tailoring and packing team initiates dispatch. Please contact our support team immediately via WhatsApp (+91 98400 12345).'
    },
    {
      category: 'shipping',
      q: 'How long will it take for my order to arrive?',
      a: 'Orders are dispatched within 24 to 48 hours. Delivery takes approximately 2-4 business days for South India metros, and 3-7 business days for the rest of India.'
    },
    {
      category: 'shipping',
      q: 'How do I qualify for free shipping?',
      a: 'All orders valued at ₹999 and above automatically qualify for Free Standard Delivery across India.'
    },
    {
      category: 'sizing',
      q: 'How do I choose the correct size for my child or myself?',
      a: 'Please refer to our comprehensive Size Guide page, which details age-based measurements for baby/kids wear (0-3M to 2-3Y) and standard bust/waist dimensions for women (XS to XXL).'
    },
    {
      category: 'sizing',
      q: 'Do you offer maternity wear friendly fits?',
      a: 'Yes! Our maternity and nursing collection features relaxed fits, breathable natural fabrics, and feeding-friendly concealed zips and buttons designed to celebrate style in every stage.'
    },
    {
      category: 'fabrics',
      q: 'What does "Baby Gentle" fabric mean?',
      a: 'Our Baby Gentle promise means we select only premium, ultra-soft, breathable combed cottons, muslins, and organic natural blends that are hypoallergenic and gentle on baby’s sensitive skin.'
    },
    {
      category: 'fabrics',
      q: 'How should I care for delicate embroidered garments?',
      a: 'We recommend gentle hand washing in cold water with a mild baby-safe detergent. Dry inside-out in shade and avoid harsh direct ironing over delicate thread embroidery.'
    }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqData 
    : faqData.filter(f => f.category === activeCategory);

  const toggleFaq = (idx) => {
    setOpenIndex(prev => prev === idx ? null : idx);
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 py-10 md:py-16 text-left">
      <nav className="text-[11px] uppercase tracking-widest text-black/50 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <span className="text-black font-semibold">FAQs</span>
      </nav>

      <div className="border-b border-beige pb-6 mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <HelpCircle className="w-5 h-5 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Help & Answers</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-wider text-black">
          Frequently Asked Questions
        </h1>
        <p className="text-xs md:text-sm text-black/60 max-w-2xl mt-2 leading-relaxed">
          Find answers to common questions about orders, payments, shipping, sizing, and baby-gentle fabric care.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: 'all', label: 'All Questions' },
          { key: 'orders', label: 'Orders & Payments' },
          { key: 'shipping', label: 'Shipping & Delivery' },
          { key: 'sizing', label: 'Sizing & Maternity' },
          { key: 'fabrics', label: 'Baby Gentle Fabrics' }
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => { setActiveCategory(cat.key); setOpenIndex(null); }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all ${
              activeCategory === cat.key
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-cream/40 text-black/70 border-beige hover:border-black'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQs List */}
      <div className="max-w-4xl space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="bg-white border border-beige rounded-sm overflow-hidden transition-all">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 md:p-5 flex justify-between items-center text-left hover:bg-cream/20 transition-colors"
              >
                <span className="font-serif text-sm md:text-base font-bold text-black pr-4">
                  {faq.q}
                </span>
                <ChevronDown className={`w-4 h-4 text-black/60 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-accent' : ''
                }`} />
              </button>
              {isOpen && (
                <div className="px-4 md:px-5 pb-5 text-xs text-black/70 leading-relaxed border-t border-beige/40 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still need help */}
      <div className="mt-14 p-6 md:p-8 bg-cream/40 border border-beige rounded-sm max-w-4xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-black">
            Still Have a Question?
          </h3>
          <p className="text-xs text-black/60 mt-1">
            Our concierge team is here to help you select sizes, track parcels, or style your wardrobe.
          </p>
        </div>
        <Link to="/contact" className="bg-black text-white text-xs font-bold tracking-widest uppercase px-6 py-3 hover:bg-accent transition-colors shrink-0 rounded-sm">
          Contact Support
        </Link>
      </div>

    </div>
  );
}
