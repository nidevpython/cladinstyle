import React from 'react';
import { Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist, addToCart, setActiveTransition } = useApp();
  const isSaved = isInWishlist(product.id);
  const [isClickScaled, setIsClickScaled] = React.useState(false);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Default size selection helper
    const defaultSize = product.sizes ? product.sizes[0] : 'S';
    const defaultColor = product.colors ? product.colors[0] : 'Default';
    addToCart(product.id, defaultSize, defaultColor, 1);
  };

  const handleProductClick = (e) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth < 768 || prefersReducedMotion) {
      // Mobile or reduced motion: immediate redirect
      return;
    }

    e.preventDefault();

    const cardEl = e.currentTarget.closest('.product-card');
    const imgEl = cardEl ? cardEl.querySelector('img') : null;
    if (!imgEl) {
      navigate(`/product/${product.id}`);
      return;
    }

    const rect = imgEl.getBoundingClientRect();
    setIsClickScaled(true);

    setActiveTransition({
      id: product.id,
      image: product.image,
      startRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    });

    setTimeout(() => {
      setIsClickScaled(false);
      navigate(`/product/${product.id}`);
    }, 620);
  };

  return (
    <div 
      className={`group relative bg-white border border-beige rounded-[3px] flex flex-col justify-between overflow-hidden product-card transition-all duration-300 ${
        isClickScaled ? 'z-20 shadow-[0_8px_24px_rgba(0,0,0,0.08)]' : ''
      }`}
      style={isClickScaled ? { transform: 'scale(1.02)' } : {}}
    >
      
      {/* Product Image Frame */}
      <Link to={`/product/${product.id}`} onClick={handleProductClick} className="block relative aspect-[4/5] overflow-hidden bg-cream">
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy" 
          className="w-full h-full object-cover"
        />

        {/* Discount Badge */}
        {product.discount && (
          <span className="absolute top-3 left-3 bg-accent text-white text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 z-10">
            {product.discount}% OFF
          </span>
        )}

        {/* Wishlist Toggle Heart Button */}
        <button 
          onClick={handleHeartClick}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/85 flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.1)] z-10 hover:bg-white wishlist-btn"
          aria-label="Toggle Wishlist"
        >
          <Heart className={`h-3.5 w-3.5 transition-colors ${isSaved ? 'fill-accent text-accent' : 'text-black/60'}`} />
        </button>

        {/* Desktop Hover Add Actions */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 to-transparent z-10 hidden md:flex justify-center add-to-bag-container">
          <button 
            onClick={handleAddClick}
            className="w-full bg-white text-black text-[9px] font-bold tracking-widest uppercase py-2.5 shadow-[0_3px_6px_rgba(0,0,0,0.08)] hover:bg-black hover:text-white transition-colors"
          >
            Add to Bag
          </button>
        </div>
      </Link>

      {/* Info Block */}
      <div className="p-3.5 text-left flex-grow flex flex-col justify-between">
        <div>
          <span className="text-[8px] font-semibold text-black/40 uppercase tracking-widest">
            {product.category === 'baby' ? "Baby's Boutique" : "Women's Collection"}
          </span>
          <Link to={`/product/${product.id}`} onClick={handleProductClick}>
            <h3 className="text-[11px] font-semibold tracking-wide text-text leading-snug line-clamp-1 mt-1 hover:text-accent transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex justify-between items-center mt-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-black">₹{product.price.toLocaleString()}</span>
            {product.oldPrice && (
              <span className="text-[10px] text-black/40 line-through">₹{product.oldPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Mobile quick add button */}
          <button 
            onClick={handleAddClick}
            className="md:hidden bg-black text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5"
          >
            + Add
          </button>
        </div>
      </div>

    </div>
  );
}
