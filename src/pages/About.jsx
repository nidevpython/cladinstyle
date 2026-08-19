import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/images/boutique_hero_lifestyle.jpg';

export default function About() {
  return (
    <div className="max-w-[1320px] mx-auto px-5 pt-5 pb-20">
      
      {/* Breadcrumbs */}
      <nav className="text-[9px] font-bold tracking-widest uppercase text-black/40 mb-6 text-left">
        <Link to="/" className="hover:text-black">Home</Link> / <span className="text-black">Our Story</span>
      </nav>

      {/* Page Title */}
      <div className="border-b border-beige pb-2.5 mb-8 text-left">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wider">Our Story</h2>
        <p className="text-[11px] text-black/50 font-medium mt-0.5 font-sans">
          The heritage and philosophy of Clad in Style Boutique.
        </p>
      </div>

      {/* Story grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-12 text-left">
        <div className="flex flex-col gap-4">
          <span className="text-[9px] font-bold tracking-[0.25em] text-accent uppercase">Designed With Love</span>
          <h3 className="font-serif text-2xl md:text-3xl font-semibold uppercase leading-tight">
            Beautiful Clothes for the ones who matter most
          </h3>
          <p className="text-xs text-black/70 leading-relaxed">
            At <strong>Clad in Style Boutique</strong>, we believe that fashion should be both elegant and comfortable. Founded in 2026, our design studio focuses on curated, luxury staples for women and exceptionally soft, organic cotton apparel for babies.
          </p>
          <p className="text-xs text-black/70 leading-relaxed">
            We avoid mass production in favor of small, thoughtful batches. Every weave, button, and hem is inspected to ensure it meets our rigorous premium criteria. For babies, we strictly select hypoallergenic, GOTS-certified organic cotton, and double-gauze muslin to keep delicate skin irritation-free. For women, our linen blends, khadi cottons, and traditional handloom kurtas offer a contemporary silhouette styled for everyday luxury.
          </p>
        </div>

        <div className="aspect-[16/10] border border-beige overflow-hidden bg-cream shrink-0">
          <img src={heroImage} alt="About Clad in Style boutique tailoring" className="w-100 h-100 object-cover" />
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-beige text-left">
        
        <div className="flex flex-col gap-2">
          <h4 className="font-serif text-sm font-bold tracking-wider uppercase text-black">
            01. Sustainable Fabrics
          </h4>
          <p className="text-xs text-black/60 leading-relaxed">
            We source natural fibers including french linen, pure khadi cotton, and organic muslin that are gentle on skin and biodegrade naturally.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="font-serif text-sm font-bold tracking-wider uppercase text-black">
            02. Thoughtful Design
          </h4>
          <p className="text-xs text-black/60 leading-relaxed">
            From elastic waistbands to tag-free designs, every clothing item is conceptualized to support dynamic, active play and elegant styling.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="font-serif text-sm font-bold tracking-wider uppercase text-black">
            03. Ethical Sewing
          </h4>
          <p className="text-xs text-black/60 leading-relaxed">
            Our manufacturing partners guarantee fair-wages, safe working conditions, and follow zero-waste cutting guidelines.
          </p>
        </div>

      </div>

    </div>
  );
}
