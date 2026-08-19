import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Clock, Send, Check } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [msg, setMsg] = useState('');
  
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 pt-5 pb-20">
      
      {/* Breadcrumbs */}
      <nav className="text-[9px] font-bold tracking-widest uppercase text-black/40 mb-6 text-left">
        <Link to="/" className="hover:text-black">Home</Link> / <span className="text-black">Contact Us</span>
      </nav>

      {/* Page Title */}
      <div className="border-b border-beige pb-2.5 mb-8 text-left">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wider">Contact Us</h2>
        <p className="text-[11px] text-black/50 font-medium mt-0.5">
          Have questions or need support? Drop us a message.
        </p>
      </div>

      {isSent ? (
        <div className="max-w-[500px] mx-auto my-14 border border-beige bg-cream p-10 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold uppercase tracking-wider">Message Sent</h2>
            <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest mt-1">We'll get back to you shortly</p>
          </div>
          <p className="text-xs text-black/70 leading-relaxed max-w-sm mt-1">
            Thank you for contacting us, <strong>{name}</strong>. A boutique customer service coordinator will review your inquiry and follow up at <strong className="text-text">{email}</strong> within 24 business hours.
          </p>
          <button 
            onClick={() => {
              setIsSent(false);
              setName('');
              setEmail('');
              setSubject('');
              setMsg('');
            }}
            className="mt-4 bg-black text-white text-[9px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-accent transition-colors"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 items-start text-left">
          
          {/* Left Info Columns */}
          <div className="flex flex-col gap-6">
            <h3 className="font-serif text-sm font-bold tracking-widest uppercase border-b border-beige pb-2">
              Boutique Studio
            </h3>

            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-black/50 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-black">Clad in Style HQ</h4>
                <p className="text-xs text-black/60 leading-relaxed mt-1">
                  <br />
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-black/50 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-black">Email Support</h4>
                <a href="mailto:support@cladinstyle.com" className="text-xs text-black/60 hover:text-black mt-1 block">
                  cladinstyle.in@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="h-5 w-5 text-black/50 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-black">Call Us</h4>
                <p className="text-xs text-black/60 mt-1">+91 8921933403</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="h-5 w-5 text-black/50 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-black">Operational Hours</h4>
                <p className="text-xs text-black/60 mt-1 leading-relaxed">
                  Monday – Sunday: 10:00 AM – 9:00 PM IST<br />
                </p>
              </div>
            </div>

          </div>

          {/* Right Form Columns */}
          <div className="flex flex-col gap-6">
            <h3 className="font-serif text-sm font-bold tracking-widest uppercase border-b border-beige pb-2">
              Send Inquiry
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="f-name" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Your Name *</label>
                  <input 
                    type="text" 
                    id="f-name" 
                    required 
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3 bg-white outline-none focus:border-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="f-email" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Email Address *</label>
                  <input 
                    type="email" 
                    id="f-email" 
                    required 
                    placeholder="yourname@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-beige text-xs py-2.5 px-3 bg-white outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="f-subject" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Subject</label>
                <input 
                  type="text" 
                  id="f-subject" 
                  placeholder="Order details, custom sizing, etc."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border border-beige text-xs py-2.5 px-3 bg-white outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="f-msg" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Your Message *</label>
                <textarea 
                  id="f-msg" 
                  required 
                  rows={6}
                  placeholder="Type your inquiry details here..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="border border-beige text-xs py-2.5 px-3 bg-white outline-none resize-none focus:border-black"
                />
              </div>

              <button 
                type="submit"
                className="self-start flex items-center gap-2 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-8 py-3.5 hover:bg-accent transition-colors"
              >
                <span>Send Message</span>
                <Send className="h-3 w-3" />
              </button>

            </form>
          </div>

        </div>
      )}

    </div>
  );
}
