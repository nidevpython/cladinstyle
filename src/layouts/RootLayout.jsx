import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import SearchOverlay from '../components/SearchOverlay';
import Toast from '../components/Toast';
import { ArrowUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RootLayout() {
  const location = useLocation();
  const { activeTransition, setActiveTransition, loadingProducts } = useApp();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isCentered, setIsCentered] = useState(false);

  // Center coordinate transitions for the product preview click card
  useEffect(() => {
    if (activeTransition) {
      const frame = requestAnimationFrame(() => {
        // Force styling class activation in next browser tick
        setTimeout(() => setIsCentered(true), 20);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsCentered(false);
    }
  }, [activeTransition]);

  // When location pathname shifts, close/reset any active transition and jump to top
  useEffect(() => {
    setActiveTransition(null);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname, setActiveTransition]);

  // Attach IntersectionObserver for scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -30px 0px'
    });

    const targets = document.querySelectorAll('.reveal:not(.active), .reveal-stagger:not(.active), .product-grid-stagger:not(.active), .reveal-heading:not(.active), .reveal-heading-center:not(.active), .reveal-slide-left:not(.active), .reveal-slide-right:not(.active), .reveal-fade-scale:not(.active)');
    targets.forEach(target => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, [location.pathname, loadingProducts]);

  // Monitor scroll for back-to-top display (passive + rAF throttled)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 400;
          setShowScrollTop(prev => (prev !== shouldShow ? shouldShow : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Universal header navigation */}
      <Navbar />

      {/* Pages Container */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Slideout shopping bag */}
      <CartDrawer />

      {/* Global catalog search */}
      <SearchOverlay />

      {/* Success/Alert Toast box notifications */}
      <Toast />

      {/* Universal footer */}
      <Footer />

      {/* Back to top float button */}
      <button
        onClick={scrollToTop}
        className={`fixed z-40 bg-black text-white border border-white/20 flex items-center justify-center transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        } hover:bg-accent hover:text-white bottom-4 right-4 w-10 h-10 md:bottom-6 md:left-6 md:right-auto md:w-10 md:h-10`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      {/* Premium Cinematic Product Card Transition Overlay */}
      {activeTransition && (
        <div className={`flying-overlay-wrapper ${isCentered ? 'active' : ''}`}>
          <div className="flying-overlay-bg" />
          <img
            src={activeTransition.image}
            alt="Transitioning Product"
            className={`flying-image ${isCentered ? 'centered' : ''}`}
            style={{
              top: activeTransition.startRect.top,
              left: activeTransition.startRect.left,
              width: activeTransition.startRect.width,
              height: activeTransition.startRect.height,
            }}
          />
        </div>
      )}
    </div>
  );
}
