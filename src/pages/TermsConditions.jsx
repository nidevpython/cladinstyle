import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="max-w-[1320px] mx-auto px-5 py-10 md:py-16 text-left">
      <nav className="text-[11px] uppercase tracking-widest text-black/50 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <span className="text-black font-semibold">Terms & Conditions</span>
      </nav>

      <div className="border-b border-beige pb-6 mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <FileText className="w-5 h-5 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Store Agreement</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-wider text-black">
          Terms & Conditions
        </h1>
        <p className="text-xs md:text-sm text-black/60 max-w-2xl mt-2 leading-relaxed">
          Welcome to Clad in Style Boutique. By using our website and placing orders, you agree to comply with the terms outlined below.
        </p>
      </div>

      <div className="bg-white border border-beige p-6 md:p-10 rounded-sm space-y-8 text-xs text-black/70 leading-relaxed max-w-4xl">
        <div>
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-2.5">1. General Overview</h2>
          <p>
            This website is operated by Clad in Style Boutique. Throughout the site, the terms "we", "us", and "our" refer to Clad in Style Boutique. By visiting our site or purchasing our products, you engage in our service and agree to be bound by these Terms & Conditions.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-2.5">2. Handcrafted Products & Color Accuracy</h2>
          <p>
            Many of our garments feature intricate hand embroidery and natural fabric weaves. While we make every effort to display garment colors and textures accurately, slight variations in shade may occur due to device monitor calibrations and the natural artisanal dyeing processes.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-2.5">3. Pricing & Order Acceptance</h2>
          <p>
            All prices listed on the website are in Indian Rupees (INR) and inclusive of applicable GST unless stated otherwise. We reserve the right to refuse or cancel orders in cases of pricing inaccuracies or unforeseen inventory shortages. If an order is cancelled after payment deduction, the full amount will be refunded promptly.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-2.5">4. Intellectual Property</h2>
          <p>
            All content on this website, including garment designs, photography, text, graphics, and the Clad in Style logo, is the exclusive intellectual property of Clad in Style Boutique and protected under applicable copyright laws.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-2.5">5. Governing Law</h2>
          <p>
            These Terms & Conditions and any separate agreements shall be governed by and construed in accordance with the laws of India, under the jurisdiction of the courts of Chennai, Tamil Nadu.
          </p>
        </div>
      </div>
    </div>
  );
}
