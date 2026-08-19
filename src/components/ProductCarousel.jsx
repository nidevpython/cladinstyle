import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductCarousel({ productsList }) {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    const container = carouselRef.current;
    if (!container) return;
    
    // Scroll distance based on container width
    const scrollAmount = container.offsetWidth * 0.75;
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  return (
    <div className="relative group">
      
      {/* Scroll Left Button */}
      <button 
        onClick={() => scroll('left')}
        className="absolute top-1/2 left-[-20px] z-10 w-10 h-10 bg-white border border-beige rounded-full flex items-center justify-center -translate-y-1/2 shadow-[0_2px_5px_rgba(0,0,0,0.05)] opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
        aria-label="Scroll Left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Product cards container */}
      <div 
        ref={carouselRef}
        className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar py-1.5 px-0.5 reveal-stagger"
      >
        {productsList.map(product => (
          <div 
            key={product.id} 
            className="w-[calc((100%-20px)/2)] sm:w-[calc((100%-40px)/3)] lg:w-[calc((100%-80px)/5)] shrink-0"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button 
        onClick={() => scroll('right')}
        className="absolute top-1/2 right-[-20px] z-10 w-10 h-10 bg-white border border-beige rounded-full flex items-center justify-center -translate-y-1/2 shadow-[0_2px_5px_rgba(0,0,0,0.05)] opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
        aria-label="Scroll Right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

    </div>
  );
}
