import React from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist } = useApp();

  return (
    <div className="max-w-[1320px] mx-auto px-5 pt-5 pb-20">
      
      {/* Page Title */}
      <div className="border-b border-beige pb-2.5 mb-8 text-left">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wider flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent fill-accent" />
          <span>My Wishlist</span>
        </h2>
        <p className="text-[11px] text-black/50 font-medium mt-0.5">
          Items you've saved to browse later.
        </p>
      </div>

      {/* Grid listing */}
      {wishlist.length === 0 ? (
        <div className="max-w-[500px] mx-auto my-14 border border-dashed border-beige p-10 text-center flex flex-col items-center">
          <Heart className="h-10 w-10 text-beige mb-4" />
          <h3 className="font-serif text-lg font-semibold mb-1.5 text-black">Your wishlist is empty.</h3>
          <p className="text-[11px] text-black/50 mb-5 leading-normal max-w-sm">
            You haven't saved any items yet. Browse our collections to add designs to your wishlist.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/baby" className="bg-black text-white text-[9px] font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-accent transition-colors">
              Shop Baby
            </Link>
            <Link to="/women" className="border border-black text-black text-[9px] font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-cream transition-colors">
              Shop Women
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
