import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ruler, Info } from 'lucide-react';

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState('baby');

  return (
    <div className="max-w-[1320px] mx-auto px-5 py-10 md:py-16 text-left">
      <nav className="text-[11px] uppercase tracking-widest text-black/50 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <span className="text-black font-semibold">Size Guide</span>
      </nav>

      <div className="border-b border-beige pb-6 mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <Ruler className="w-5 h-5 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Fit & Measurements</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-wider text-black">
          Boutique Size Guide
        </h1>
        <p className="text-xs md:text-sm text-black/60 max-w-2xl mt-2 leading-relaxed">
          Grace in Every Stitch, Style in Every Stage. Find your perfect fit across our baby wear, kids collection, maternity dresses, and women's cord sets.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveTab('baby')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all ${
            activeTab === 'baby'
              ? 'bg-black text-white border-black shadow-sm'
              : 'bg-cream/40 text-black/70 border-beige hover:border-black'
          }`}
        >
          Baby & Kids (0 - 3 Years)
        </button>
        <button
          onClick={() => setActiveTab('women')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border rounded-sm transition-all ${
            activeTab === 'women'
              ? 'bg-black text-white border-black shadow-sm'
              : 'bg-cream/40 text-black/70 border-beige hover:border-black'
          }`}
        >
          Women & Maternity (XS - XXL)
        </button>
      </div>

      {/* Tab 1: Baby */}
      {activeTab === 'baby' && (
        <div className="space-y-8 max-w-4xl">
          <div className="bg-white border border-beige p-6 md:p-8 rounded-sm shadow-sm overflow-x-auto">
            <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-black mb-4">
              Baby & Infant Sizing Chart (Inches & cm)
            </h2>
            <table className="w-full text-left border-collapse border border-beige text-xs">
              <thead>
                <tr className="bg-cream/70 text-black font-bold uppercase text-[11px]">
                  <th className="p-3 border border-beige">Age Bracket</th>
                  <th className="p-3 border border-beige">Chest (in)</th>
                  <th className="p-3 border border-beige">Length (in)</th>
                  <th className="p-3 border border-beige">Estimated Weight</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-beige font-semibold">0 - 3 Months</td>
                  <td className="p-3 border border-beige">17 - 18" (43 - 46 cm)</td>
                  <td className="p-3 border border-beige">14" (36 cm)</td>
                  <td className="p-3 border border-beige">Up to 5.5 kg</td>
                </tr>
                <tr className="bg-cream/20">
                  <td className="p-3 border border-beige font-semibold">3 - 6 Months</td>
                  <td className="p-3 border border-beige">18 - 19" (46 - 48 cm)</td>
                  <td className="p-3 border border-beige">15" (38 cm)</td>
                  <td className="p-3 border border-beige">5.5 - 7.5 kg</td>
                </tr>
                <tr>
                  <td className="p-3 border border-beige font-semibold">6 - 12 Months</td>
                  <td className="p-3 border border-beige">19 - 20" (48 - 51 cm)</td>
                  <td className="p-3 border border-beige">16.5" (42 cm)</td>
                  <td className="p-3 border border-beige">7.5 - 10 kg</td>
                </tr>
                <tr className="bg-cream/20">
                  <td className="p-3 border border-beige font-semibold">12 - 18 Months</td>
                  <td className="p-3 border border-beige">20 - 21" (51 - 53 cm)</td>
                  <td className="p-3 border border-beige">18" (46 cm)</td>
                  <td className="p-3 border border-beige">10 - 12 kg</td>
                </tr>
                <tr>
                  <td className="p-3 border border-beige font-semibold">18 - 24 Months</td>
                  <td className="p-3 border border-beige">21 - 22" (53 - 56 cm)</td>
                  <td className="p-3 border border-beige">19.5" (50 cm)</td>
                  <td className="p-3 border border-beige">12 - 14 kg</td>
                </tr>
                <tr className="bg-cream/20">
                  <td className="p-3 border border-beige font-semibold">2 - 3 Years</td>
                  <td className="p-3 border border-beige">22 - 23" (56 - 58 cm)</td>
                  <td className="p-3 border border-beige">21" (53 cm)</td>
                  <td className="p-3 border border-beige">14 - 16 kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-cream/40 border border-beige rounded-sm flex items-start gap-3 text-xs text-black/70">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tip for Growing Little Ones:</strong> Babies grow quickly! If your child is between sizes or above average in height/weight, we recommend opting for one size up for maximum comfort.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Women */}
      {activeTab === 'women' && (
        <div className="space-y-8 max-w-4xl">
          <div className="bg-white border border-beige p-6 md:p-8 rounded-sm shadow-sm overflow-x-auto">
            <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-black mb-4">
              Women's Apparel & Cord Sets Sizing (Inches)
            </h2>
            <table className="w-full text-left border-collapse border border-beige text-xs">
              <thead>
                <tr className="bg-cream/70 text-black font-bold uppercase text-[11px]">
                  <th className="p-3 border border-beige">Size</th>
                  <th className="p-3 border border-beige">Bust (in)</th>
                  <th className="p-3 border border-beige">Waist (in)</th>
                  <th className="p-3 border border-beige">Hips (in)</th>
                  <th className="p-3 border border-beige">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-beige font-semibold">XS (32)</td>
                  <td className="p-3 border border-beige">32 - 33"</td>
                  <td className="p-3 border border-beige">26 - 27"</td>
                  <td className="p-3 border border-beige">35 - 36"</td>
                  <td className="p-3 border border-beige">14"</td>
                </tr>
                <tr className="bg-cream/20">
                  <td className="p-3 border border-beige font-semibold">S (34)</td>
                  <td className="p-3 border border-beige">34 - 35"</td>
                  <td className="p-3 border border-beige">28 - 29"</td>
                  <td className="p-3 border border-beige">37 - 38"</td>
                  <td className="p-3 border border-beige">14.5"</td>
                </tr>
                <tr>
                  <td className="p-3 border border-beige font-semibold">M (36)</td>
                  <td className="p-3 border border-beige">36 - 37"</td>
                  <td className="p-3 border border-beige">30 - 31"</td>
                  <td className="p-3 border border-beige">39 - 40"</td>
                  <td className="p-3 border border-beige">15"</td>
                </tr>
                <tr className="bg-cream/20">
                  <td className="p-3 border border-beige font-semibold">L (38)</td>
                  <td className="p-3 border border-beige">38 - 39"</td>
                  <td className="p-3 border border-beige">32 - 33"</td>
                  <td className="p-3 border border-beige">41 - 42"</td>
                  <td className="p-3 border border-beige">15.5"</td>
                </tr>
                <tr>
                  <td className="p-3 border border-beige font-semibold">XL (40)</td>
                  <td className="p-3 border border-beige">40 - 42"</td>
                  <td className="p-3 border border-beige">34 - 36"</td>
                  <td className="p-3 border border-beige">43 - 45"</td>
                  <td className="p-3 border border-beige">16"</td>
                </tr>
                <tr className="bg-cream/20">
                  <td className="p-3 border border-beige font-semibold">XXL (42)</td>
                  <td className="p-3 border border-beige">42 - 44"</td>
                  <td className="p-3 border border-beige">36 - 38"</td>
                  <td className="p-3 border border-beige">45 - 47"</td>
                  <td className="p-3 border border-beige">16.5"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-cream/40 border border-beige rounded-sm flex items-start gap-3 text-xs text-black/70">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Maternity Silhouette Note:</strong> Our maternity wear designs feature intentional roominess and soft waistbands that accommodate bump growth. Order your pre-pregnancy size for the best fit.
            </p>
          </div>
        </div>
      )}

      {/* How to Measure Section */}
      <div className="mt-12 bg-white border border-beige p-6 md:p-8 rounded-sm max-w-4xl">
        <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-4">
          How to Measure Accurately
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-black/70">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-black mb-1">1. Bust / Chest</h4>
            <p className="leading-relaxed">Measure around the fullest part of your chest, keeping the tape parallel to the floor.</p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider text-black mb-1">2. Natural Waist</h4>
            <p className="leading-relaxed">Measure around the narrowest point of your waistline, comfortably loose without pulling tight.</p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider text-black mb-1">3. Hips</h4>
            <p className="leading-relaxed">Stand with feet together and measure around the fullest part of your hips and seat.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
