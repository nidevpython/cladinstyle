import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchOverlay() {
  const { products, isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const activeProducts = products.filter(p => p.isActive !== false);
    const cleanQuery = query.toLowerCase();
    const matches = activeProducts.filter(
      p => p.name.toLowerCase().includes(cleanQuery) || 
           p.category.toLowerCase().includes(cleanQuery) ||
           p.description.toLowerCase().includes(cleanQuery)
    );
    setResults(matches.slice(0, 8));
  }, [query, products]);

  const handlePopularSearch = (term) => {
    setQuery(term);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-90 bg-black/95 pt-20 animate-fadein overflow-y-auto">
      <div className="max-w-[800px] mx-auto px-5">
        
        {/* Search Input Box */}
        <div className="flex items-center gap-3 border-b border-white/20 pb-3 mb-8">
          <Search className="h-5.5 w-5.5 text-white/50 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search baby dresses, rompers, women's kurtas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white font-serif text-xl md:text-22px uppercase tracking-wider outline-none placeholder:text-white/30"
          />
          <button 
            onClick={() => setIsSearchOpen(false)} 
            className="p-1 text-white hover:text-accent transition-colors shrink-0"
          >
            <X className="h-6.5 w-6.5" />
          </button>
        </div>

        {/* Suggestion tags or results */}
        <div className="text-left pb-10">
          {query.trim() === '' ? (
            <div>
              <h4 className="text-[10px] font-bold tracking-widest text-white/40 uppercase mb-4">Popular Searches</h4>
              <div className="flex flex-wrap gap-2.5">
                {['Floral Kurta', 'Muslin Romper', 'Bow Dress', 'Linen Co-ord', 'Sleepsuit'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => handlePopularSearch(tag)}
                    className="border border-white/10 hover:border-white text-white/70 hover:text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div>
              <h4 className="text-[10px] font-bold tracking-widest text-white/40 uppercase mb-4">Search Results</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {results.map(product => (
                  <Link 
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex flex-col text-left group"
                  >
                    <div className="aspect-[4/5] bg-white/5 overflow-hidden border border-white/10 mb-2">
                      <img src={product.image} alt={product.name} className="w-100 h-100 object-cover group-hover:scale-103 transition-transform duration-500" />
                    </div>
                    <span className="text-[8px] text-white/40 uppercase tracking-widest">{product.category}</span>
                    <span className="text-xs font-semibold text-white line-clamp-1 group-hover:text-accent transition-colors mt-0.5">{product.name}</span>
                    <span className="text-xs font-bold text-white mt-1">₹{product.price.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-white/50 font-serif text-lg py-10 text-center">
              No products found matching your search.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
