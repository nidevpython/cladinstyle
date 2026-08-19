import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Filter, X } from 'lucide-react';

export default function Shop({ type }) {
  const { products, loadingProducts } = useApp();

  // Base products filtered by section type
  const [baseList, setBaseList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);

  // Filter criteria states
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [sortBy, setSortBy] = useState('featured');

  // Mobile filters overlay drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Derive initial catalog base list (only show active products)
  useEffect(() => {
    if (loadingProducts) return;

    const activeProducts = products.filter(p => p.isActive !== false);
    let list = [...activeProducts];
    if (type === 'baby') {
      list = activeProducts.filter(p => p.category === 'baby');
    } else if (type === 'women') {
      list = activeProducts.filter(p => p.category === 'women');
    } else if (type === 'new') {
      list = activeProducts.filter(p => p.isNew);
    } else if (type === 'best') {
      list = activeProducts.filter(p => p.isBestSeller);
    }
    setBaseList(list);
    setFilteredList(list);

    // Reset filters on page changes
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(2500);
    setSortBy('featured');
  }, [type, products, loadingProducts]);

  // Derive unique sizes and colors dynamically from matching list
  const availableSizes = Array.from(new Set(baseList.flatMap(p => p.sizes || []))).sort();
  const availableColors = Array.from(new Set(baseList.flatMap(p => p.colors || []).filter(c => c !== 'Default'))).sort();

  // Apply filtering whenever filters change
  useEffect(() => {
    let list = [...baseList];

    // 1. Size Check
    if (selectedSizes.length > 0) {
      list = list.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
    }

    // 2. Color Check
    if (selectedColors.length > 0) {
      list = list.filter(p => p.colors?.some(c => selectedColors.includes(c)));
    }

    // 3. Price Check
    list = list.filter(p => p.price <= maxPrice);

    // 4. Sorting Options
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (sortBy === 'best') {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    setFilteredList(list);
  }, [baseList, selectedSizes, selectedColors, maxPrice, sortBy]);

  // Handler helpers
  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // Get Page Meta Info (Header visual text configurations)
  const getPageMeta = () => {
    switch (type) {
      case 'baby':
        return {
          title: 'Baby Boutique',
          banner: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1200&auto=format&fit=crop',
          desc: 'Soft natural fabrics & timeless designs carefully crafted for baby\'s delicate skin.'
        };
      case 'women':
        return {
          title: 'Women Collection',
          banner: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop',
          desc: 'Elegant design lines & luxurious contemporary silhouettes crafted for every special occasion.'
        };
      case 'new':
        return {
          title: 'New Arrivals',
          banner: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
          desc: 'Explore our latest contemporary designs and luxury essentials for women and babies.'
        };
      case 'best':
        return {
          title: 'Best Sellers',
          banner: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
          desc: 'Our most-loved boutique apparel and GOTS-certified baby essentials, back by popular demand.'
        };
      default:
        return {
          title: 'Shop All',
          banner: heroImage,
          desc: 'Curated apparel collections for her and little ones.'
        };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="max-w-[1320px] mx-auto px-5 pt-5 pb-20">
      
      {/* 1. Breadcrumbs */}
      <nav className="text-[9px] font-bold tracking-widest uppercase text-black/40 mb-4 text-left">
        <Link to="/" className="hover:text-black">Home</Link> / <span className="text-black">{meta.title}</span>
      </nav>

      {/* 2. Page Category Banner */}
      <div className="relative aspect-[32/9] overflow-hidden border border-beige flex items-center p-6 md:p-10 mb-8 text-left">
        <img src={meta.banner} alt={meta.title} className="absolute inset-0 w-full h-full object-cover object-center z-1" />
        <div className="absolute inset-0 bg-black/45 z-2" />
        <div className="relative z-10 text-white max-w-[450px]">
          <h2 className="font-serif text-3xl md:text-4xl font-black uppercase tracking-wider leading-none">
            {meta.title}
          </h2>
          <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
            {meta.desc}
          </p>
        </div>
      </div>

      {/* 3. Toolbar (Sort select and filters count info) */}
      <div className="flex justify-between items-center border-y border-beige py-3 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 border border-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest"
          >
            <Filter className="h-3 w-3" />
            <span>Filters</span>
          </button>
          <span className="text-[11px] font-bold text-black/50">
            Showing {filteredList.length} of {baseList.length} products
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-[9px] font-bold uppercase tracking-widest text-black/50">Sort By</label>
          <select 
            id="sort" 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-beige bg-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 outline-none"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="best">Best Selling</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 4. Main Shop Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-10 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:flex flex-col gap-6 text-left">
          
          {/* Sizes filter list */}
          {availableSizes.length > 0 && (
            <div className="border-b border-beige pb-5">
              <h3 className="font-serif text-xs font-bold tracking-widest uppercase mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`border text-[10px] font-bold px-3 py-1.5 uppercase transition-colors duration-200 ${
                      selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'border-beige hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors checkmark list */}
          {availableColors.length > 0 && (
            <div className="border-b border-beige pb-5">
              <h3 className="font-serif text-xs font-bold tracking-widest uppercase mb-3">Color</h3>
              <div className="flex flex-col gap-2">
                {availableColors.map(color => (
                  <label key={color} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedColors.includes(color)}
                      onChange={() => handleColorToggle(color)}
                      className="hidden" 
                    />
                    <span className={`w-3.5 h-3.5 border border-beige flex items-center justify-center text-[9px] font-bold ${
                      selectedColors.includes(color) ? 'bg-black border-black text-white' : 'bg-white'
                    }`}>
                      {selectedColors.includes(color) && '✓'}
                    </span>
                    <span>{color}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Slider */}
          <div className="pb-5">
            <h3 className="font-serif text-xs font-bold tracking-widest uppercase mb-3">
              Max Price: ₹{maxPrice.toLocaleString()}
            </h3>
            <input 
              type="range" 
              min="500" 
              max="2500" 
              step="50" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-black/45 mt-1.5">
              <span>₹500</span>
              <span>₹2,500</span>
            </div>
          </div>

        </aside>

        {/* Product Grid Items */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-cream border border-beige rounded-[3px] p-4 flex flex-col justify-between">
                <div className="w-full h-3/4 bg-beige mb-2 rounded-[2px]" />
                <div className="h-3 bg-beige w-2/3 mb-1 rounded" />
                <div className="h-3 bg-beige w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : filteredList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {filteredList.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="font-serif text-base text-black/40 text-center py-20 lg:col-span-1">
            No products match the selected criteria.
          </div>
        )}

      </div>

      {/* 5. Mobile Filters Slide-out Drawer */}
      <div 
        onClick={() => setIsMobileFiltersOpen(false)}
        className={`fixed inset-0 z-80 bg-black/50 transition-opacity duration-300 lg:hidden ${
          isMobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div className={`fixed top-0 left-0 z-90 h-full w-[280px] bg-white p-6 shadow-2xl transition-transform duration-300 lg:hidden flex flex-col justify-between ${
        isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        <div className="overflow-y-auto flex-grow pb-5 text-left">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-sm font-bold tracking-widest uppercase">Filters</h3>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1 hover:text-accent transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Sizes */}
            {availableSizes.length > 0 && (
              <div className="border-b border-beige pb-5">
                <h3 className="font-serif text-xs font-bold tracking-widest uppercase mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`border text-[10px] font-bold px-3 py-1.5 uppercase ${
                        selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'border-beige'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {availableColors.length > 0 && (
              <div className="border-b border-beige pb-5">
                <h3 className="font-serif text-xs font-bold tracking-widest uppercase mb-3">Color</h3>
                <div className="flex flex-col gap-2">
                  {availableColors.map(color => (
                    <label key={color} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedColors.includes(color)}
                        onChange={() => handleColorToggle(color)}
                        className="hidden" 
                      />
                      <span className={`w-3.5 h-3.5 border border-beige flex items-center justify-center text-[9px] font-bold ${
                        selectedColors.includes(color) ? 'bg-black border-black text-white' : 'bg-white'
                      }`}>
                        {selectedColors.includes(color) && '✓'}
                      </span>
                      <span>{color}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Slider */}
            <div>
              <h3 className="font-serif text-xs font-bold tracking-widest uppercase mb-3">
                Max Price: ₹{maxPrice.toLocaleString()}
              </h3>
              <input 
                type="range" 
                min="500" 
                max="2500" 
                step="50" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-black/45 mt-1.5">
                <span>₹500</span>
                <span>₹2,500</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsMobileFiltersOpen(false)}
          className="w-full bg-black text-white text-[10px] font-bold tracking-widest uppercase py-3 hover:bg-accent transition-colors"
        >
          Apply Filters
        </button>

      </div>

    </div>
  );
}
