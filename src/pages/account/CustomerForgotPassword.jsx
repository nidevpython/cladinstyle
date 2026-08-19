import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../supabase';
import { Link } from 'react-router-dom';
import { AlertCircle, Check, ArrowLeft } from 'lucide-react';

export default function CustomerForgotPassword() {
  const { showToast } = useApp();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      // Use window.location.origin + hash structure for HashRouter compatibility
      const resetRedirectUrl = `${window.location.origin}/#/account/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirectUrl
      });

      if (error) throw error;

      setSuccess(true);
      showToast('Password reset email sent successfully.', 'success');
    } catch (err) {
      console.error('Password reset request failed:', err);
      setErrorMsg(err.message || 'Unable to send recovery email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 py-20 flex items-center justify-center font-sans">
      <div className="max-w-[450px] w-full bg-white border border-beige p-6 md:p-8 rounded-[3px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] space-y-6 text-left">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-2xl font-black uppercase tracking-wider text-black">
            Reset Password
          </h2>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            Request recovery link for your shopper account
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-accent/5 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs leading-relaxed font-semibold">
              ✓ Recovery instructions have been sent to <strong className="text-black font-bold">{email}</strong>. Please check your inbox and spam folders.
            </div>
            <Link
              to="/account/login"
              className="w-full bg-black text-white text-[10px] font-bold tracking-widest uppercase py-3 text-center block hover:bg-accent transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Email Address *</label>
              <input 
                type="email" 
                id="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@domain.com"
                className="border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white text-[10px] font-bold tracking-widest uppercase py-3.5 mt-2 hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending Instructions...' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        {/* Back link */}
        <div className="border-t border-beige pt-4 text-center">
          <Link 
            to="/account/login" 
            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-black/50 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
