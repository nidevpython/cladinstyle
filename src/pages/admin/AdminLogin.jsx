import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already authenticated, redirect to /admin
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // verify if admin
        const { data: isAdmin } = await supabase.rpc('is_admin');
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('email')
          .eq('id', session.user.id)
          .single();

        if (isAdmin || adminRecord) {
          navigate('/admin');
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
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

      if (error) throw error;

      // Check if user is in admin_users or public.is_admin()
      const { data: isUserAdmin } = await supabase.rpc('is_admin');
      const { data: adminRecord, error: adminErr } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!isUserAdmin && !adminRecord) {
        // Sign out if not authorized
        await supabase.auth.signOut();
        setErrorMsg('Access Denied: You are not authorized to view the admin dashboard.');
        showToast('Unauthorized access attempt.', 'error');
      } else {
        showToast('Logged in successfully!');
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      showToast('Please enter your email to request a reset link.', 'info');
      setErrorMsg('Please enter your email to request a reset link.');
      return;
    }
    // Supabase reset password
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/admin/settings`, // redirect to settings in the spa router
    }).then(({ error }) => {
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Password reset link sent to your email.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 font-sans">
      <div className="w-full max-w-[420px] bg-white border border-beige p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] text-left rounded-[3px]">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-[28px] font-black uppercase tracking-[0.2em] text-black leading-tight">
            Clad in Style
          </h1>
          <span className="block font-serif text-[10px] tracking-[0.4em] uppercase text-black/50 mt-1">
            Boutique
          </span>
          <div className="w-12 h-[1px] bg-accent mx-auto mt-4 mb-4" />
          <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
            Admin Panel
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-accent/5 border border-accent/25 text-accent text-[11px] font-bold uppercase tracking-wider">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-black/50 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black/40">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cladinstyle.com"
                className="w-full bg-cream/35 border border-beige pl-10 pr-4 py-3 text-xs outline-none focus:border-black transition-colors rounded-[3px]"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-black/50">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[9px] font-bold tracking-wider text-accent hover:underline uppercase"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black/40">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cream/35 border border-beige pl-10 pr-10 py-3 text-xs outline-none focus:border-black transition-colors rounded-[3px]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-black/40 hover:text-black"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-[11px] font-bold tracking-[0.2em] uppercase py-3.5 mt-2 hover:bg-black/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-[3px]"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
