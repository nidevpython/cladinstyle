import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, MapPin, Clock, PackageCheck, AlertCircle } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="max-w-[1320px] mx-auto px-5 py-10 md:py-16 text-left">
      <nav className="text-[11px] uppercase tracking-widest text-black/50 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <span className="text-black font-semibold">Shipping Policy</span>
      </nav>

      <div className="border-b border-beige pb-6 mb-12">
        <div className="flex items-center gap-2.5 mb-2">
          <Truck className="w-5 h-5 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Safe & Reliable Delivery</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-wider text-black">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs md:text-sm text-black/60 max-w-2xl mt-2 leading-relaxed">
          We ship handcrafted clothing across India with premium courier partners, ensuring your baby garments and women’s apparel arrive in pristine condition.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-cream/50 border border-beige rounded-sm">
          <PackageCheck className="w-6 h-6 text-accent mb-3" />
          <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">Free Shipping</h3>
          <p className="text-xs text-black/60 mt-2 leading-relaxed">
            Enjoy <strong>FREE delivery</strong> across India on all prepaid & COD orders valued at ₹999 or above.
          </p>
        </div>
        <div className="p-6 bg-cream/50 border border-beige rounded-sm">
          <Clock className="w-6 h-6 text-accent mb-3" />
          <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">24-48h Dispatch</h3>
          <p className="text-xs text-black/60 mt-2 leading-relaxed">
            Ready-to-wear orders are processed and handed over to logistics partners within 1 to 2 business days.
          </p>
        </div>
        <div className="p-6 bg-cream/50 border border-beige rounded-sm">
          <ShieldCheck className="w-6 h-6 text-accent mb-3" />
          <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">Insured Transit</h3>
          <p className="text-xs text-black/60 mt-2 leading-relaxed">
            Every shipment is tracked and insured with verified courier services (Blue Dart, Delhivery, DTDC).
          </p>
        </div>
      </div>

      <div className="bg-white border border-beige p-6 md:p-10 rounded-sm space-y-8 text-xs text-black/70 leading-relaxed max-w-4xl">
        <div>
          <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-black mb-3">1. Shipping Charges</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Orders above ₹999:</strong> Free Standard Shipping across India.</li>
            <li><strong>Orders below ₹999:</strong> Flat shipping charge of ₹99 applied at checkout.</li>
            <li><strong>Cash on Delivery (COD):</strong> Available in eligible serviceable pin codes at no additional convenience fee.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-black mb-3">2. Estimated Delivery Timelines</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-beige text-xs">
              <thead>
                <tr className="bg-cream/60">
                  <th className="p-3 border border-beige font-bold uppercase text-black">Region</th>
                  <th className="p-3 border border-beige font-bold uppercase text-black">Estimated Delivery</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-beige font-medium">South India (Chennai, Bangalore, Hyderabad, Kochi)</td>
                  <td className="p-3 border border-beige">2 to 4 Business Days</td>
                </tr>
                <tr>
                  <td className="p-3 border border-beige font-medium">Major Metro Cities (Mumbai, Delhi NCR, Kolkata, Pune)</td>
                  <td className="p-3 border border-beige">3 to 5 Business Days</td>
                </tr>
                <tr>
                  <td className="p-3 border border-beige font-medium">Rest of India & Tier 2 / 3 Towns</td>
                  <td className="p-3 border border-beige">4 to 7 Business Days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-black/50 mt-2">
            * Please note: Custom hand-embroidered silhouettes may require an additional 2 to 3 days of tailoring before dispatch.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-black mb-3">3. Tracking Your Parcel</h2>
          <p>
            Once your order leaves our boutique studio, you will receive an SMS and email notification containing the AWB tracking number and courier tracking link. You can also view live updates directly on our <Link to="/track-order" className="underline font-bold text-black">Track Order page</Link>.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-black mb-3">4. Packaging & Damaged Parcels</h2>
          <p>
            We take extreme care to ensure garments are enclosed in waterproof, dust-free boutique packaging. If the outer parcel appears tampered with or severely damaged upon arrival, please refuse delivery and notify our team at <strong>support@cladinstyle.com</strong> with photographs within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
