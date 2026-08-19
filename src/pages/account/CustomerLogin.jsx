import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

export default function CustomerLogin() {
  const { customer, showToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (customer) {
      navigate('/account');
    }
  }, [customer, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email address or password.');
        } else {
          throw error;
        }
      }

      showToast('Signed in successfully.');
      navigate('/account');
    } catch (err) {
      console.error('Customer login error:', err);
      setErrorMsg(err.message || 'Unable to connect to account service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 py-16 md:py-24 flex items-center justify-center font-sans">
      <div className="max-w-[450px] w-full bg-white border border-beige p-6 md:p-8 rounded-[3px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] space-y-6 text-left">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-2xl font-black uppercase tracking-wider text-black">
            Sign In
          </h2>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            Access your boutique shopping profile
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-accent/5 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Email Address *</label>
            <input 
              type="email" 
              id="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Password *</label>
              <Link 
                to="/account/forgot-password" 
                className="text-[9px] font-bold uppercase tracking-wider text-accent hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password" 
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

          {/* Remember session checkbox */}
          <label className="flex items-center gap-2.5 pt-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberSession}
              onChange={(e) => setRememberSession(e.target.checked)}
              className="hidden"
            />
            <span className={`w-4 h-4 border border-beige flex items-center justify-center text-[10px] font-bold rounded-[2px] transition-colors ${
              rememberSession ? 'bg-black border-black text-white' : 'bg-white'
            }`}>
              {rememberSession && <Check className="h-3 w-3" />}
            </span>
            <span className="text-[9px] font-bold tracking-wider uppercase text-black/50">Remember Session</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-[10px] font-bold tracking-widest uppercase py-3.5 mt-2 hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer link to register */}
        <div className="border-t border-beige pt-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">
            Don't have an account?{' '}
            <Link to="/account/register" className="text-accent hover:underline">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
