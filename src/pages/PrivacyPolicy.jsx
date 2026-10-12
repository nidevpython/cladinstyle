import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-[1320px] mx-auto px-5 py-10 md:py-16 text-left">
      <nav className="text-[11px] uppercase tracking-widest text-black/50 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <span className="text-black font-semibold">Privacy Policy</span>
      </nav>

      <div className="border-b border-beige pb-6 mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Your Trust & Privacy</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-wider text-black">
          Privacy Policy
        </h1>
        <p className="text-xs md:text-sm text-black/60 max-w-2xl mt-2 leading-relaxed">
          Clad in Style Boutique values your trust. This Privacy Policy outlines how your personal information is collected, safeguarded, and utilized.
        </p>
      </div>

      <div className="bg-white border border-beige p-6 md:p-10 rounded-sm space-y-8 text-xs text-black/70 leading-relaxed max-w-4xl">
        <div>
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-2.5">1. Information We Collect</h2>
          <p className="mb-2">When you browse our boutique or place an order, we collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Personal Contact Data:</strong> Name, billing and shipping address, email address, and phone number.</li>
            <li><strong>Order History:</strong> Product purchases, size preferences, order numbers, and transaction timestamps.</li>
            <li><strong>Technical Information:</strong> IP address, device type, and browser details used to optimize your website experience.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-2.5">2. Payment Data Security</h2>
          <p>
            Your payment security is paramount. We do <strong>not</strong> store or hold complete credit card details, debit card pins, or UPI credentials on our servers. All transactions are routed directly through certified, PCI-DSS compliant payment gateways that utilize end-to-end 256-bit SSL encryption.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-2.5">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fulfilling and delivering your clothing orders to the correct address.</li>
            <li>Sending order tracking notifications, SMS shipping updates, and invoices.</li>
            <li>Providing customer support for returns, exchanges, and custom sizing requests.</li>
            <li>Sending newsletter updates on new boutique collections (you may opt out at any time).</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-2.5">4. Sharing with Third Parties</h2>
          <p>
            We do not sell, trade, or rent customer personal information to third parties. We disclose data solely to trusted partners necessary for business operations: logistics courier services (Blue Dart, Delhivery, DTDC) for delivery, and secure payment processors.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-black mb-2.5">5. Contact Our Privacy Officer</h2>
          <p>
            If you have questions about your personal data or wish to request data correction, please email us at: <a href="mailto:support@cladinstyle.com" className="font-bold text-black hover:text-accent underline">support@cladinstyle.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
