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
              “Grace in Every Stitch, Style in Every Stage.” Thoughtfully designed apparel for women and children.
            </p>
            <div className="flex gap-3 mt-1.5">
              <a href="https://www.instagram.com/clad_in_style_cis/" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Instagram">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Facebook">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Pinterest">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
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
              <li><Link to="/gift-cards" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Gift Cards</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase mb-5">Customer Service</h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li><Link to="/track-order" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Track Order</Link></li>
              <li><Link to="/shipping-policy" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Shipping Policy</Link></li>
              <li><Link to="/faqs" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">FAQs</Link></li>
              <li><Link to="/size-guide" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Size Guide</Link></li>
            </ul>
          </div>

          {/* Column 4: About Us links */}
          <div>
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase mb-5">About</h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              <li><Link to="/about" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">About Us</Link></li>
              <li><Link to="/contact" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Contact Us</Link></li>
              <li><Link to="/privacy-policy" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="text-xs text-white/60 hover:text-white hover:pl-0.5 transition-all">Terms & Conditions</Link></li>
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
              “Grace in Every Stitch, Style in Every Stage.” Thoughtfully designed apparel for women and children.
            </p>
            <div className="flex gap-4 mt-1">
              <a href="https://www.instagram.com/clad_in_style_cis/" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent transition-colors" aria-label="Pinterest">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
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
                <li><Link to="/gift-cards" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Gift Cards</span><span className="text-[10px] text-white/30">›</span></Link></li>
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
                <li><Link to="/track-order" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Track Order</span><span className="text-[10px] text-white/30">›</span></Link></li>
                <li><Link to="/shipping-policy" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Shipping Policy</span><span className="text-[10px] text-white/30">›</span></Link></li>
                <li><Link to="/faqs" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>FAQs</span><span className="text-[10px] text-white/30">›</span></Link></li>
                <li><Link to="/size-guide" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Size Guide</span><span className="text-[10px] text-white/30">›</span></Link></li>
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
                <li><Link to="/privacy-policy" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Privacy Policy</span><span className="text-[10px] text-white/30">›</span></Link></li>
                <li><Link to="/terms-conditions" className="text-xs text-white/60 hover:text-white flex justify-between items-center"><span>Terms & Conditions</span><span className="text-[10px] text-white/30">›</span></Link></li>
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
        </div>

      </div>
    </footer>
  );
}
