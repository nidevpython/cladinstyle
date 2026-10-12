import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/images/boutique_hero_lifestyle.jpg';
import { Compass, Target, Sparkles, Heart, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-[1320px] mx-auto px-5 pt-5 pb-20">
      
      {/* Breadcrumbs */}
      <nav className="text-[9px] font-bold tracking-widest uppercase text-black/40 mb-6 text-left">
        <Link to="/" className="hover:text-black">Home</Link> / <span className="text-black">About Us</span>
      </nav>

      {/* Page Title */}
      <div className="border-b border-beige pb-4 mb-10 text-left">
        <h2 className="font-serif text-2xl md:text-3xl font-bold uppercase tracking-wider">About Us</h2>
        <p className="text-xs text-black/60 font-medium mt-1 font-sans">
          Grace in Every Stitch, Style in Every Stage.
        </p>
      </div>

      {/* Story grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-center mb-16 text-left">
        <div className="flex flex-col gap-4">
          <span className="text-[9px] font-bold tracking-[0.25em] text-accent uppercase">
            The Brand Story
          </span>
          <h3 className="font-serif text-2xl md:text-3xl font-semibold uppercase leading-tight">
            Clothing as Expression, Identity & Effortless Comfort
          </h3>
          <p className="text-xs text-black/75 leading-relaxed">
            At <strong>Clad In Style</strong>, we believe that what you wear is more than just fabric—it is an authentic form of expression, identity, and comfort. Rooted in refined craftsmanship and modern sensibilities, our boutique brand is thoughtfully curated for <strong>women, mothers, and children</strong> across every stage of life.
          </p>
          <p className="text-xs text-black/75 leading-relaxed">
            Whether it is the gentle embrace of pure organic fabrics for little ones, effortless maternity silhouettes designed for evolving bodies, or finely tailored ensembles for women, each garment reflects a harmonious blend of trendsetting style and enduring ease.
          </p>
          <p className="text-xs text-black/75 leading-relaxed">
            From intricate <strong>embroidery works</strong> and delicate hand-finished details to versatile <strong>cord sets, maternity wear, kids wear, and graceful frocks</strong>, every piece is designed with purpose, passion, and meticulous care.
          </p>
        </div>

        <div className="aspect-[16/11] border border-beige overflow-hidden bg-cream shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <img 
            src={heroImage} 
            alt="Clad In Style Boutique tailoring and embroidery" 
            className="w-full h-full object-cover object-[76%_20%]" 
          />
        </div>
      </div>

      {/* Vision & Mission Highlight Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 text-left">
        
        {/* Vision Card */}
        <div className="border border-beige bg-cream/35 p-8 md:p-10 flex flex-col justify-between relative group hover:border-black transition-colors">
          <div>
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-5 shadow-sm">
              <Compass className="h-5 w-5 text-accent" />
            </div>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-accent block mb-2">
              Our Vision
            </span>
            <h4 className="font-serif text-lg md:text-xl font-bold uppercase tracking-wide text-black mb-3">
              Lifestyle with Craftsmanship
            </h4>
            <p className="text-xs md:text-sm text-black/80 leading-relaxed italic font-serif">
              “To become a trusted and stylish lifestyle brand that delivers comfort, elegance, and craftsmanship for women and children across India with high quality standards.”
            </p>
          </div>
          <div className="w-12 h-[2px] bg-accent mt-6" />
        </div>

        {/* Mission Card */}
        <div className="border border-beige bg-cream/35 p-8 md:p-10 flex flex-col justify-between relative group hover:border-black transition-colors">
          <div>
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-5 shadow-sm">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-accent block mb-2">
              Our Mission
            </span>
            <h4 className="font-serif text-lg md:text-xl font-bold uppercase tracking-wide text-black mb-3">
              Timeless Silhouette & Detail
            </h4>
            <p className="text-xs md:text-sm text-black/80 leading-relaxed italic font-serif">
              “To design high-quality, stylish, and functional apparel that blends modern trends with timeless craftsmanship—especially through detailed embroidery and thoughtfully designed silhouettes.”
            </p>
          </div>
          <div className="w-12 h-[2px] bg-accent mt-6" />
        </div>

      </div>

      {/* Signature Collections Showcase */}
      <div className="border-t border-beige pt-12 text-left mb-16">
        <div className="max-w-xl mb-8">
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-accent block mb-1">
            Curated Collections
          </span>
          <h3 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-wider text-black">
            Designed for Every Stage
          </h3>
          <p className="text-xs text-black/60 mt-1">
            Signature categories crafted with gentle comfort and artisanal embroidery.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { title: 'Cord Sets', desc: 'Effortless coordinated sets for modern daily luxury.' },
            { title: 'Maternity Wear', desc: 'Comfortable, breathable silhouettes designed for evolving motherhood.' },
            { title: 'Kids Wear', desc: 'Soft, playful, and baby-gentle pieces made for joyful moments.' },
            { title: 'Embroidery Works', desc: 'Intricate needlework celebrating artisanal heritage.' },
            { title: 'Frocks', desc: 'Charming, beautifully draped designs for girls and special occasions.' }
          ].map((cat, idx) => (
            <div key={idx} className="border border-beige p-5 bg-white flex flex-col justify-between hover:border-black transition-colors">
              <div>
                <span className="text-[9px] font-mono font-bold text-accent">0{idx + 1}</span>
                <h5 className="font-serif text-sm font-bold uppercase tracking-wider text-black mt-2 mb-1.5">
                  {cat.title}
                </h5>
                <p className="text-[11px] text-black/65 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-beige text-left">
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-black">
            <Sparkles className="h-4 w-4 text-accent" />
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase">
              01. Artisanal Embroidery
            </h4>
          </div>
          <p className="text-xs text-black/65 leading-relaxed">
            Every stitch is guided by tradition and contemporary design, creating tactile needlework that elevates everyday apparel into treasured garments.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-black">
            <Heart className="h-4 w-4 text-accent" />
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase">
              02. Baby Gentle Standards
            </h4>
          </div>
          <p className="text-xs text-black/65 leading-relaxed">
            We meticulously choose skin-friendly, breathable cottons, linen blends, and hypoallergenic textiles that protect delicate skin and guarantee all-day comfort.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-black">
            <Award className="h-4 w-4 text-accent" />
            <h4 className="font-serif text-sm font-bold tracking-wider uppercase">
              03. Quality Craftsmanship
            </h4>
          </div>
          <p className="text-xs text-black/65 leading-relaxed">
            Produced in conscientious small batches, our apparel adheres to strict quality inspections to ensure long-lasting wear and enduring elegance.
          </p>
        </div>

      </div>

    </div>
  );
}
