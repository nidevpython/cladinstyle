import React, { useState } from 'react';
import { Home as HomeIcon, Upload, ArrowRight, Eye, Check, Edit, Image } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminHomepage() {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);

  // Simulated Homepage Hero content
  const [heroHeading, setHeroHeading] = useState('Made for\nEvery Moment.');
  const [heroSub, setHeroSub] = useState('New Arrivals');
  const [heroDescription, setHeroDescription] = useState('“Stylish. Comfortable. Made with love.\nFor the ones who matter most.”');
  const [heroUrl, setHeroUrl] = useState('https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1200&auto=format&fit=crop');

  // Simulated promo banners
  const [promos, setPromos] = useState([
    { id: 1, title: 'Baby', desc: 'Adorable styles for every little moment.', tag: 'For your little ones' },
    { id: 2, title: 'Women', desc: 'Elegant looks for every occasion.', tag: 'For every you' }
  ]);

  const handleSaveHomepage = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Homepage draft configuration saved locally.');
    }, 800);
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-[1000px] mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-black uppercase tracking-wider text-black">
            Homepage Manager
          </h1>
          <p className="text-xs text-black/50 mt-1 font-semibold uppercase tracking-wider">
            Draft and structure banner layout slides and landing page collections.
          </p>
        </div>
        <button
          onClick={() => window.open('/#/', '_blank')}
          className="inline-flex items-center gap-1.5 border border-black text-black hover:bg-cream text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-[3px]"
        >
          <Eye className="h-4 w-4" />
          <span>View Site</span>
        </button>
      </div>

      {/* Development Notice */}
      <div className="p-4 bg-cream border border-beige text-black text-[10px] font-bold uppercase tracking-wider rounded-[3px]">
        ℹ Note: The homepage_content database table is not active yet. Changes in this section run in simulated mode, preparing the schema structures for deployment in the next database phase.
      </div>

      <form onSubmit={handleSaveHomepage} className="space-y-8">
        
        {/* SECTION 1: HERO SLIDER SECTION */}
        <div className="bg-white border border-beige p-6 md:p-8 rounded-[3px] space-y-5">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-2 flex items-center gap-2">
            <HomeIcon className="h-4 w-4 text-accent" />
            <span>Hero Section Configuration</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Subtitle / Eyebrow */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Hero Eyebrow (e.g. New Arrivals)</label>
              <input
                type="text"
                value={heroSub}
                onChange={(e) => setHeroSub(e.target.value)}
                placeholder="New Arrivals"
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            {/* Heading text */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Hero Title Heading</label>
              <input
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                placeholder="Made for Every Moment."
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Hero Paragraph Description</label>
              <textarea
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                placeholder="Stylish. Comfortable. Made with love..."
                rows={2}
                className="w-full bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            {/* Image URL / Upload */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1">Hero Background Image</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/.../hero-lifestyle.jpg"
                  className="flex-grow bg-cream/35 border border-beige px-3.5 py-2.5 text-xs outline-none focus:border-black rounded-[3px]"
                />
                <button
                  type="button"
                  onClick={() => alert('Supabase Storage uploads are active for product creation/editing. Homepage assets upload can be enabled in next database phase.')}
                  className="border border-beige hover:border-black text-[9px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-[3px] inline-flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </button>
              </div>

              {/* Banner Image Preview */}
              {heroUrl && (
                <div className="aspect-[32/10] bg-cream border border-beige overflow-hidden relative flex items-center p-6 rounded-[3px] mt-2">
                  <img src={heroUrl} alt="hero-preview" className="absolute inset-0 w-full h-full object-cover z-0 opacity-80" />
                  <div className="absolute inset-0 bg-black/40 z-1" />
                  <div className="relative z-10 text-white text-left max-w-sm">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-accent">{heroSub}</span>
                    <h2 className="font-serif text-xl font-bold uppercase tracking-wider mt-1">{heroHeading}</h2>
                    <p className="text-[10px] text-white/70 mt-1 truncate">{heroDescription}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: CATEGORY BANNERS SECTION */}
        <div className="bg-white border border-beige p-6 md:p-8 rounded-[3px] space-y-5">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-2 flex items-center gap-2">
            <Image className="h-4 w-4 text-accent" />
            <span>Category Promo Cards</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promos.map((promo, idx) => (
              <div key={promo.id} className="border border-beige p-4 rounded-[3px] bg-cream/10 space-y-3 text-left">
                <span className="text-[8px] font-bold text-accent tracking-widest uppercase">Promo Box {promo.id}</span>
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-black/55 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={promo.tag}
                    onChange={(e) => {
                      const updated = [...promos];
                      updated[idx].tag = e.target.value;
                      setPromos(updated);
                    }}
                    className="w-full bg-white border border-beige px-3 py-1.5 text-xs outline-none focus:border-black rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-black/55 mb-1">Heading Title</label>
                  <input
                    type="text"
                    value={promo.title}
                    onChange={(e) => {
                      const updated = [...promos];
                      updated[idx].title = e.target.value;
                      setPromos(updated);
                    }}
                    className="w-full bg-white border border-beige px-3 py-1.5 text-xs outline-none focus:border-black rounded-[2px] font-serif"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-black/55 mb-1">Description Paragraph</label>
                  <input
                    type="text"
                    value={promo.desc}
                    onChange={(e) => {
                      const updated = [...promos];
                      updated[idx].desc = e.target.value;
                      setPromos(updated);
                    }}
                    className="w-full bg-white border border-beige px-3 py-1.5 text-xs outline-none focus:border-black rounded-[2px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white text-[10px] font-bold tracking-widest uppercase px-8 py-3.5 hover:bg-accent transition-all rounded-[3px] inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <span>Saving Draft...</span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save Configuration Draft</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
