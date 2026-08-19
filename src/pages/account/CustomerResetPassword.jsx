import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

export default function CustomerResetPassword() {
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Optional: Check if we have an active access token in URL fragment
  useEffect(() => {
    const hash = window.location.hash || '';
    if (!hash.includes('access_token=') && !hash.includes('type=recovery')) {
      // In Supabase, if we are in this route, the user clicked a link containing the auth code.
      // Supabase client handles parsing and setting the session in the background.
      // So if no active session is detected after a few seconds, warn them.
    }
  }, []);

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in both fields.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      showToast('Your password has been successfully updated.', 'success');
      setTimeout(() => {
        navigate('/account/login');
      }, 2000);
    } catch (err) {
      console.error('Password update failed:', err);
      setErrorMsg(err.message || 'Unable to update password. Session may have expired.');
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
            Choose New Password
          </h2>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            Specify a secure password for your shopper account
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-accent/5 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold text-center leading-relaxed">
            ✓ Password updated successfully! Redirecting you to sign in...
          </div>
        ) : (
          <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
            
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pass" className="text-[9px] font-bold uppercase tracking-wider text-black/60">New Password (min 8 chars) *</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="pass" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-beige text-xs py-2.5 pl-3.5 pr-10 outline-none focus:border-black rounded-[2px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-black/40 hover:text-black"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cpass" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Confirm New Password *</label>
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="cpass" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white text-[10px] font-bold tracking-widest uppercase py-3.5 mt-2 hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
