import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import logoImg from '../assets/images/clad-in-style-logo.png';

export default function Footer() {
  const { showToast } = useApp();
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (section) => {
    setActiveAccordion(prev => prev === section ? null : section);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    showToast('Thank you for subscribing to our newsletter!', 'success');
    e.target.reset();
  };

  const handleLinkClick = (e, text) => {
    e.preventDefault();
    showToast(`${text} pages and triggers are simulated in this boutique demo.`, 'info');
  };

  return (
    <footer className="bg-black text-white pt-16 md:pt-20 pb-8 border-t border-white/10">
      <div className="max-w-[1320px] mx-auto px-5">
        
        {/* Desktop Grid Layout (hidden on mobile, visible on medium screens and up) */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-10 pb-10 border-b border-white/10 text-left reveal-stagger">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="block max-w-[140px] shrink-0">
              <img src={logoImg} alt="Clad in Style Boutique" className="w-[120px] md:w-[135px] h-auto object-contain" />
            </Link>
            <p className="text-xs text-white/60 leading-relaxed max-w-[220px]">
              For her. Love for little ones. Thoughtfully designed clothing for baby & women.
            </p>
            <div className="flex gap-3 mt-1.5">
              <a href="https://www.instagram.com/clad_in_style_cis/" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Instagram">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Facebook">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Twitter">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#pinterest" onClick={(e) => handleLinkClick(e, 'Pinterest')} className="text-white/60 hover:text-accent transition-colors font-serif text-[13px] font-bold" aria-label="Pinterest">
                P
              </a>
            </div>
          </div>

          {/* Column 2: Shop Link Indices */}
          <div>
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase mb-5">Shop</h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li><Link to="/baby" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Baby Clothing</Link></li>
              <li><Link to="/women" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Women's Clothing</Link></li>
              <li><Link to="/new-arrivals" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">New Arrivals</Link></li>
              <li><Link to="/women" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Best Sellers</Link></li>
              <li><a href="#giftcards" onClick={(e) => handleLinkClick(e, 'Gift Cards')} className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Gift Cards</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase mb-5">Customer Service</h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li><a href="#track" onClick={(e) => handleLinkClick(e, 'Order Tracking')} className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Track Order</a></li>
              <li><a href="#returns" onClick={(e) => handleLinkClick(e, 'Returns')} className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Returns & Exchange</a></li>
              <li><a href="#shipping" onClick={(e) => handleLinkClick(e, 'Shipping Policy')} className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Shipping Policy</a></li>
              <li><a href="#faqs" onClick={(e) => handleLinkClick(e, 'FAQs')} className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">FAQs</a></li>
              <li><a href="#sizeguide" onClick={(e) => handleLinkClick(e, 'Size Guide')} className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Size Guide</a></li>
            </ul>
          </div>

          {/* Column 4: About Us links */}
          <div>
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase mb-5">About</h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li><Link to="/about" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">About Us</Link></li>
              <li><Link to="/contact" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Contact Us</Link></li>
              <li><a href="#privacy" onClick={(e) => handleLinkClick(e, 'Privacy Policy')} className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Privacy Policy</a></li>
              <li><a href="#terms" onClick={(e) => handleLinkClick(e, 'Terms')} className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Column 5: Newsletter signup */}
          <div>
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase mb-5">Newsletter</h4>
            <p className="text-xs text-white/60 mb-4 leading-relaxed max-w-[240px]">
              Subscribe to get exclusive offers and new arrivals updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex border-b border-white/20 pb-1.5 max-w-[220px]">
              <input 
                type="email" 
                placeholder="Enter your email" 
                required 
                className="bg-transparent border-0 text-white text-xs py-1 px-1.5 w-full outline-none placeholder:text-white/30"
              />
              <button type="submit" className="text-white hover:text-accent transition-colors p-1" aria-label="Subscribe">
                <Mail className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Mobile Accordions and Branding Layout (visible only on mobile) */}
        <div className="md:hidden flex flex-col gap-6 pb-8 border-b border-white/10 text-left">
          
          {/* Logo, Description, and Socials */}
          <div className="flex flex-col items-start gap-4">
            <Link to="/" className="block max-w-[130px] shrink-0">
              <img src={logoImg} alt="Clad in Style Boutique" className="w-[110px] h-auto object-contain" />
            </Link>
            <p className="text-xs text-white/60 leading-relaxed max-w-[320px]">
              For her. Love for little ones. Thoughtfully designed clothing for baby & women.
            </p>
            <div className="flex gap-4 mt-1">
              <a href="https://www.instagram.com/clad_in_style_cis/" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#pinterest" onClick={(e) => handleLinkClick(e, 'Pinterest')} className="text-white/60 hover:text-accent transition-colors font-serif text-[15px] font-bold" aria-label="Pinterest">
                P
              </a>
            </div>
          </div>

          {/* Accordion 1: SHOP */}
          <div className="border-t border-white/10 pt-4">
            <button 
              onClick={() => toggleAccordion('shop')}
              className="w-full flex justify-between items-center text-left py-2 font-serif text-sm font-bold tracking-wider uppercase text-white"
            >
              <span>Shop</span>
              <span className={`text-[9px] transition-transform duration-300 ${activeAccordion === 'shop' ? 'rotate-90' : ''}`}>▶</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'shop' ? 'max-h-[250px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0 pb-4">
                <li><Link to="/baby" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Baby Clothing</span><span className="text-[10px] text-white/30">›</span></Link></li>
                <li><Link to="/women" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Women's Clothing</span><span className="text-[10px] text-white/30">›</span></Link></li>
                <li><Link to="/new-arrivals" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>New Arrivals</span><span className="text-[10px] text-white/30">›</span></Link></li>
                <li><Link to="/women" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Best Sellers</span><span className="text-[10px] text-white/30">›</span></Link></li>
                <li><a href="#giftcards" onClick={(e) => handleLinkClick(e, 'Gift Cards')} className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Gift Cards</span><span className="text-[10px] text-white/30">›</span></a></li>
              </ul>
            </div>
          </div>

          {/* Accordion 2: CUSTOMER SERVICE */}
          <div className="border-t border-white/10 pt-4">
            <button 
              onClick={() => toggleAccordion('service')}
              className="w-full flex justify-between items-center text-left py-2 font-serif text-sm font-bold tracking-wider uppercase text-white"
            >
              <span>Customer Service</span>
              <span className={`text-[9px] transition-transform duration-300 ${activeAccordion === 'service' ? 'rotate-90' : ''}`}>▶</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'service' ? 'max-h-[250px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0 pb-4">
                <li><a href="#track" onClick={(e) => handleLinkClick(e, 'Order Tracking')} className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Track Order</span><span className="text-[10px] text-white/30">›</span></a></li>
                <li><a href="#returns" onClick={(e) => handleLinkClick(e, 'Returns')} className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Returns & Exchange</span><span className="text-[10px] text-white/30">›</span></a></li>
                <li><a href="#shipping" onClick={(e) => handleLinkClick(e, 'Shipping Policy')} className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Shipping Policy</span><span className="text-[10px] text-white/30">›</span></a></li>
                <li><a href="#faqs" onClick={(e) => handleLinkClick(e, 'FAQs')} className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>FAQs</span><span className="text-[10px] text-white/30">›</span></a></li>
                <li><a href="#sizeguide" onClick={(e) => handleLinkClick(e, 'Size Guide')} className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Size Guide</span><span className="text-[10px] text-white/30">›</span></a></li>
              </ul>
            </div>
          </div>

          {/* Accordion 3: ABOUT */}
          <div className="border-t border-white/10 pt-4">
            <button 
              onClick={() => toggleAccordion('about')}
              className="w-full flex justify-between items-center text-left py-2 font-serif text-sm font-bold tracking-wider uppercase text-white"
            >
              <span>About</span>
              <span className={`text-[9px] transition-transform duration-300 ${activeAccordion === 'about' ? 'rotate-90' : ''}`}>▶</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'about' ? 'max-h-[200px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
              <ul className="flex flex-col gap-3.5 list-none p-0 m-0 pb-4">
                <li><Link to="/about" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>About Us</span><span className="text-[10px] text-white/30">›</span></Link></li>
                <li><Link to="/contact" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Contact Us</span><span className="text-[10px] text-white/30">›</span></Link></li>
                <li><a href="#privacy" onClick={(e) => handleLinkClick(e, 'Privacy Policy')} className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Privacy Policy</span><span className="text-[10px] text-white/30">›</span></a></li>
                <li><a href="#terms" onClick={(e) => handleLinkClick(e, 'Terms')} className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Terms & Conditions</span><span className="text-[10px] text-white/30">›</span></a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase mb-3">Newsletter</h4>
            <p className="text-xs text-white/60 mb-4 leading-relaxed">
              Subscribe to get exclusive offers and new arrivals updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex border-b border-white/20 pb-1.5 w-full">
              <input 
                type="email" 
                placeholder="Enter your email" 
                required 
                className="bg-transparent border-0 text-white text-xs py-1 px-1.5 w-full outline-none placeholder:text-white/30"
              />
              <button type="submit" className="text-white hover:text-accent transition-colors p-1" aria-label="Subscribe">
                <Mail className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Footer Bottom copyright bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4">
          <p className="text-[10px] text-white/40 tracking-wider">
            © 2026 Clad in Style Boutique. All rights reserved.
          </p>
          <div className="flex gap-2">
            {['Visa', 'Mastercard', 'UPI', 'Paytm'].map(badge => (
              <span 
                key={badge}
                className="font-sans text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 border border-white/10 bg-white/3 text-white/60 rounded-[2px]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
