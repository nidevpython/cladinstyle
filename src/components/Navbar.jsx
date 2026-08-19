import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import logoImg from '../assets/images/clad-in-style-logo.png';

export default function Navbar() {
  const {
    getCartCount,
    wishlist,
    setIsCartOpen,
    setIsSearchOpen,
    isMobileNavOpen,
    setIsMobileNavOpen,
    showToast,
    customer,
    storeLogoUrl
  } = useApp();

  const [isSticky, setIsSticky] = useState(false);
  const location = useLocation();

  // Scroll handler for sticky header scaling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav drawer when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location, setIsMobileNavOpen]);

  const activeLinkStyle = ({ isActive }) => 
    `relative text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 py-2 ${
      isActive ? 'text-accent after:w-full' : 'text-black hover:text-accent after:w-0'
    } after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-accent after:transition-all after:duration-200 hover:after:w-full`;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white">
        {/* 2. Main Header Container */}
        <nav className={`main-navbar border-b border-beige transition-all duration-300 ${isSticky ? 'scrolled' : ''}`}>
          <div className="navbar-container">
            
            {/* Left: Brand logo */}
            <Link to="/" className="brand-logo">
              <img src={storeLogoUrl ? `${storeLogoUrl}?t=${Date.now()}` : logoImg} alt="Clad in Style Boutique" />
            </Link>

            {/* Center: Navigation Links (Desktop) */}
            <div className="nav-links hidden lg:flex items-center gap-[30px]">
              <NavLink to="/" className={activeLinkStyle}>Home</NavLink>
              <NavLink to="/baby" className={activeLinkStyle}>Baby</NavLink>
              <NavLink to="/women" className={activeLinkStyle}>Women</NavLink>
              <NavLink to="/new-arrivals" className={activeLinkStyle}>New Arrivals</NavLink>
              <NavLink to="/about" className={activeLinkStyle}>About Us</NavLink>
              <NavLink to="/contact" className={activeLinkStyle}>Contact</NavLink>
            </div>

            {/* Right: Icon actions */}
            <div className="nav-actions flex items-center gap-3 sm:gap-4">
              
              {/* Search Toggle */}
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="p-1.5 text-black hover:text-accent transition-colors"
                aria-label="Search Catalog"
              >
                <Search className="h-4.5 w-4.5" />
              </button>

              {/* Account Profile Link */}
              <Link 
                to="/account" 
                className={`hidden sm:block p-1.5 transition-colors ${customer ? 'text-accent' : 'text-black hover:text-accent'}`}
                aria-label="User Account"
              >
                <User className="h-4.5 w-4.5" />
              </Link>

              {/* Wishlist Link */}
              <Link 
                to="/wishlist" 
                className="relative p-1.5 text-black hover:text-accent transition-colors"
                aria-label="My Wishlist"
              >
                <Heart className="h-4.5 w-4.5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-[7px] h-[7px] bg-accent rounded-full animate-pulse" />
                )}
              </Link>

              {/* Shopping Bag Open button */}
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative p-1.5 text-black hover:text-accent transition-colors"
                aria-label="View Shopping Bag"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                {getCartCount() > 0 && (
                  <span className="absolute top-0 right-0 w-[16px] h-[16px] bg-black text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                    {getCartCount()}
                  </span>
                )}
              </button>

              {/* Mobile hamburger menu toggle */}
              <button 
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-1.5 text-black hover:text-accent transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-5.5 w-5.5" />
              </button>

            </div>

          </div>
        </nav>
      </header>

      {/* 3. Mobile Navigation Drawer Panel */}
      <div 
        onClick={() => setIsMobileNavOpen(false)}
        className={`fixed inset-0 z-80 bg-black/50 transition-opacity duration-300 lg:hidden ${
          isMobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div className={`fixed top-0 right-0 z-90 h-full w-[280px] bg-white p-6 shadow-2xl transition-transform duration-300 lg:hidden flex flex-col justify-between ${
        isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <Link to="/" className="brand-logo">
              <img src={storeLogoUrl ? `${storeLogoUrl}?t=${Date.now()}` : logoImg} alt="Clad in Style Boutique" />
            </Link>
            <button onClick={() => setIsMobileNavOpen(false)} className="p-1 hover:text-accent transition-colors">
              <X className="h-5.5 w-5.5" />
            </button>
          </div>

          {/* Nav List */}
          <ul className="flex flex-col gap-5 text-left list-none">
            {['Home', 'Baby', 'Women', 'New Arrivals', 'About', 'Contact'].map((item) => {
              const path = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
              return (
                <li key={item}>
                  <NavLink 
                    to={path}
                    className={({ isActive }) => 
                      `text-xs font-bold tracking-widest uppercase transition-colors ${
                        isActive ? 'text-accent' : 'text-black hover:text-accent'
                      }`
                    }
                  >
                    {item}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer info in drawer */}
        <div className="border-t border-beige pt-5 text-left flex flex-col gap-4">
          <Link to="/wishlist" className="flex items-center gap-2.5 text-[11px] font-bold tracking-widest uppercase text-black/70 hover:text-accent transition-colors">
            <Heart className="h-4.5 w-4.5" />
            <span>My Wishlist</span>
          </Link>
          <Link 
            to="/account" 
            onClick={() => setIsMobileNavOpen(false)}
            className={`flex items-center gap-2.5 text-[11px] font-bold tracking-widest uppercase transition-colors ${
              customer ? 'text-accent' : 'text-black/70 hover:text-accent'
            }`}
          >
            <User className="h-4.5 w-4.5" />
            <span>My Account</span>
          </Link>
        </div>

      </div>
    </>
  );
}
