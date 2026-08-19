import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCarousel from '../components/ProductCarousel';
import { ShieldCheck, Sparkles, Truck, RotateCcw } from 'lucide-react';
import heroImage from '../assets/images/boutique_hero_lifestyle.jpg';
import InstagramFeed from '../components/InstagramFeed';

export default function Home() {
  const navigate = useNavigate();
  const { products, loadingProducts, fetchProducts } = useApp();

  // Force refetch the latest products on homepage mount
  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter lists for carousels (only show active products)
  const activeProducts = products.filter(p => p.isActive !== false);

  const featuredProducts = activeProducts.filter(p => p.isFeatured);
  const newArrivals = activeProducts.filter(p => p.isNew);
  const bestSellers = activeProducts.filter(p => p.isBestSeller);

  React.useEffect(() => {
    console.log("Homepage products:", products);
    console.log("Featured products:", featuredProducts);
    console.log("New arrivals:", newArrivals);
    console.log("Best sellers:", bestSellers);
  }, [products, featuredProducts, newArrivals, bestSellers]);

  // Baby trending section: best sellers first, otherwise general active baby products
  let babyTrending = activeProducts.filter(p => p.category === 'baby' && p.isBestSeller);
  if (babyTrending.length === 0) {
    babyTrending = activeProducts.filter(p => p.category === 'baby');
  }
  babyTrending = babyTrending.slice(0, 8);

  // Women trending section: best sellers first, otherwise general active women products
  let womenBest = activeProducts.filter(p => p.category === 'women' && p.isBestSeller);
  if (womenBest.length === 0) {
    womenBest = activeProducts.filter(p => p.category === 'women');
  }
  womenBest = womenBest.slice(0, 8);

  // Set up the CSS variable scroll handler for parallax
  React.useEffect(() => {
    const handleScroll = () => {
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.documentElement.style.removeProperty('--scroll-y');
    };
  }, []);

  return (
    <div className="w-full">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-black text-white overflow-hidden min-h-[600px] md:min-h-[650px] lg:min-h-[700px] flex items-center py-16 md:py-0">
        
        {/* Full-size absolute background image */}
        <div className="absolute inset-0 w-full h-[115%] -top-[7.5%] z-0 overflow-hidden hero-parallax-img-inner">
          <img 
            src={heroImage} 
            alt="Clad in Style Boutique Hero Background" 
            className="w-full h-full object-cover object-[62%_center] md:object-[68%_center] lg:object-[70%_center] hero-image"
          />
        </div>

        {/* Cinematic Dark Gradient Overlay */}
        <div className="hero-blend-overlay pointer-events-none z-1" />

        {/* Content Container */}
        <div className="relative z-10 max-w-[1320px] mx-auto px-5 w-full">
          <div className="max-w-[600px] flex flex-col items-start text-left md:pr-14">
            <span className="hero-eyebrow text-[11px] font-bold tracking-[0.3em] text-accent uppercase mb-3 block">
              New Arrivals
            </span>
            <h2 className="hero-heading font-serif text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.12] uppercase mb-4 tracking-tight">
              Made for<br />Every Moment.
            </h2>
            <p className="hero-desc text-sm text-white/70 max-w-[420px] mb-8 leading-relaxed">
              “Stylish. Comfortable. Made with love.<br />For the ones who matter most.”
            </p>
            <div className="hero-buttons flex gap-4 flex-wrap">
              <Link to="/baby" className="inline-flex items-center gap-2 bg-white text-black text-[11px] font-bold tracking-widest uppercase px-8 py-3.5 hover:bg-accent hover:text-white transition-all">
                Shop Baby →
              </Link>
              <Link to="/women" className="inline-flex items-center gap-2 border border-white text-white text-[11px] font-bold tracking-widest uppercase px-8 py-3.5 hover:bg-white hover:text-black transition-all">
                Shop Women →
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* 2. HERO BENEFITS STRIP */}
      <section className="bg-cream border-b border-beige py-7.5 text-black">
        <div className="max-w-[1320px] mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 reveal-stagger">
          
          <div className="flex items-start gap-3 text-left relative after:absolute after:right-[-10px] after:top-[10%] after:h-[80%] after:w-[1px] after:bg-beige after:hidden md:after:block last:after:hidden">
            <ShieldCheck className="h-6 w-6 text-black/70 shrink-0" />
            <div>
              <h4 className="font-serif text-xs font-bold tracking-widest uppercase leading-tight">Premium Quality</h4>
              <p className="text-[11px] text-black/60 mt-0.5">Soft & safe fabrics</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left relative after:absolute after:right-[-10px] after:top-[10%] after:h-[80%] after:w-[1px] after:bg-beige after:hidden md:after:block last:after:hidden">
            <Sparkles className="h-6 w-6 text-black/70 shrink-0" />
            <div>
              <h4 className="font-serif text-xs font-bold tracking-widest uppercase leading-tight">Skin Friendly</h4>
              <p className="text-[11px] text-black/60 mt-0.5">For baby's delicate skin</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left relative after:absolute after:right-[-10px] after:top-[10%] after:h-[80%] after:w-[1px] after:bg-beige after:hidden md:after:block last:after:hidden">
            <Truck className="h-6 w-6 text-black/70 shrink-0" />
            <div>
              <h4 className="font-serif text-xs font-bold tracking-widest uppercase leading-tight">Free Shipping</h4>
              <p className="text-[11px] text-black/60 mt-0.5">On orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <RotateCcw className="h-6 w-6 text-black/70 shrink-0" />
            <div>
              <h4 className="font-serif text-xs font-bold tracking-widest uppercase leading-tight">Easy Returns</h4>
              <p className="text-[11px] text-black/60 mt-0.5">7 days return policy</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CATEGORY CARDS SECTION */}
      <section className="max-w-[1320px] mx-auto px-5 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7.5 reveal-stagger">
          
          {/* Baby Category */}
          <div className="relative aspect-[16/10] overflow-hidden flex flex-col justify-end p-6 md:p-10 border border-beige group">
            <img 
              src="https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800&auto=format&fit=crop" 
              alt="Baby Collection Banner" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-104 z-1"
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors duration-300 z-2" />
            
            <div className="relative z-10 text-white text-left max-w-[340px]">
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/80">For your little ones</span>
              <h3 className="font-serif text-3xl font-bold tracking-wider uppercase mt-1 mb-2">Baby</h3>
              <p className="text-xs text-white/80 mb-5 leading-normal">Adorable styles for every little moment.</p>
              <Link to="/baby" className="inline-flex items-center gap-1.5 bg-white text-black px-4.5 py-2 text-[9px] font-bold tracking-widest uppercase hover:bg-accent hover:text-white transition-colors">
                Explore Baby →
              </Link>
            </div>
          </div>

          {/* Women Category */}
          <div className="relative aspect-[16/10] overflow-hidden flex flex-col justify-end p-6 md:p-10 border border-beige group">
            <img 
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop" 
              alt="Women Collection Banner" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-104 z-1"
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors duration-300 z-2" />

            <div className="relative z-10 text-white text-left max-w-[340px]">
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/80">For every you</span>
              <h3 className="font-serif text-3xl font-bold tracking-wider uppercase mt-1 mb-2">Women</h3>
              <p className="text-xs text-white/80 mb-5 leading-normal">Elegant looks for every occasion.</p>
              <Link to="/women" className="inline-flex items-center gap-1.5 bg-white text-black px-4.5 py-2 text-[9px] font-bold tracking-widest uppercase hover:bg-accent hover:text-white transition-colors">
                Explore Women →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. BABY PRODUCT SLIDER */}
      {babyTrending.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-5 pb-12 md:pb-20">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end pb-3 mb-8 reveal-heading text-center sm:text-left gap-2 sm:gap-0">
            <h3 className="font-serif text-xl md:text-22px font-bold tracking-wide uppercase text-black">
              Baby's Boutique
            </h3>
            <Link to="/baby" className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 hover:text-accent transition-colors">
              View All →
            </Link>
          </div>
          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-cream border border-beige rounded-[3px] p-4 flex flex-col justify-between">
                  <div className="w-full h-3/4 bg-beige mb-2 rounded-[2px]" />
                  <div className="h-3 bg-beige w-2/3 mb-1 rounded" />
                  <div className="h-3 bg-beige w-1/3 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <ProductCarousel productsList={babyTrending} />
          )}
        </section>
      )}

      {/* 5. WOMEN PRODUCT SLIDER */}
      {womenBest.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-5 pb-12 md:pb-20">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end pb-3 mb-8 reveal-heading text-center sm:text-left gap-2 sm:gap-0">
            <h3 className="font-serif text-xl md:text-22px font-bold tracking-wide uppercase text-black">
              Women's Collection
            </h3>
            <Link to="/women" className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 hover:text-accent transition-colors">
              View All →
            </Link>
          </div>
          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-cream border border-beige rounded-[3px] p-4 flex flex-col justify-between">
                  <div className="w-full h-3/4 bg-beige mb-2 rounded-[2px]" />
                  <div className="h-3 bg-beige w-2/3 mb-1 rounded" />
                  <div className="h-3 bg-beige w-1/3 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <ProductCarousel productsList={womenBest} />
          )}
        </section>
      )}

      {/* 6. EDITORIAL CAMPAIGN SECTION */}
      <section className="bg-black text-white border-y border-white/10 overflow-hidden relative min-h-[500px] lg:h-[550px] flex items-center justify-center py-16 lg:py-0 reveal">
        
        {/* Background Image Container */}
        <div className="absolute inset-0 w-full h-[115%] -top-[7.5%] z-0 overflow-hidden campaign-parallax-bg">
          <img 
            src="/assets/images/campaign-bg.jpg" 
            alt="Clad in Style Editorial Campaign Background" 
            className="w-full h-full object-cover campaign-bg-img"
          />
        </div>

        {/* Cinematic Subject Wipes/Masks */}
        <div className="absolute inset-y-0 left-0 w-1/3 bg-black z-2 transition-transform duration-[1.2s] ease-out origin-left campaign-mask-left hidden lg:block" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-black z-2 transition-transform duration-[1.2s] ease-out origin-right campaign-mask-right hidden lg:block" />

        {/* Dark Center Overlay */}
        <div className="absolute inset-0 z-1 bg-gradient-to-r from-black/20 via-black/75 to-black/20 md:via-black/70 sm:from-black/10 sm:to-black/10" />
        <div className="absolute inset-0 z-1 bg-black/45 md:hidden" />

        {/* Center Content Container */}
        <div className="relative z-10 max-w-[1320px] mx-auto px-5 w-full flex flex-col items-center text-center">
          
          <div className="max-w-[500px] flex flex-col items-center">
            <span className="text-[9px] font-bold tracking-[0.25em] text-accent uppercase mb-3 block reveal-child-1">
              Clad in Style Boutique
            </span>
            
            <h3 className="font-serif text-3.5xl sm:text-4xl lg:text-[42px] font-semibold leading-[1.15] tracking-wide uppercase mb-3.5 text-white reveal-child-2">
              The Art<br />Of Dressing
            </h3>
            
            <p className="text-[13px] font-serif italic text-cream/90 mb-4 tracking-wide reveal-child-3">
              Style made for every story.
            </p>
            
            <p className="text-[11px] text-white/60 leading-relaxed font-sans max-w-[340px] mx-auto mb-8 font-light reveal-child-4">
              “Thoughtfully designed pieces for women and little ones, made to become part of every beautiful moment.”
            </p>
            
            <div className="flex justify-center items-center gap-4 reveal-child-5">
              <Link 
                to="/women" 
                className="border border-white/20 text-white text-[9px] font-bold tracking-widest uppercase px-6 py-3.5 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              >
                Shop Women →
              </Link>
              <Link 
                to="/baby" 
                className="border border-white/20 text-white text-[9px] font-bold tracking-widest uppercase px-6 py-3.5 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              >
                Shop Baby →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 7. DYNAMIC INSTAGRAM CAROUSEL SECTION */}
      <InstagramFeed />

    </div>
  );
}
