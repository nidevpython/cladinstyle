import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

export default function CustomerRegister() {
  const { customer, showToast } = useApp();
  const navigate = useNavigate();

  // Registration Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if logged in
  useEffect(() => {
    if (customer) {
      navigate('/account');
    }
  }, [customer, navigate]);

  const validateForm = () => {
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return false;
    }
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    // Phone length check
    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return false;
    }
    // Password length
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return false;
    }
    // Confirmation match
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. SignUp in Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('This email address is already registered.');
        } else {
          throw error;
        }
      }

      const user = data.user;
      
      // 2. Insert into customer_profiles table if user ID exists
      if (user) {
        try {
          const { error: profileErr } = await supabase
            .from('customer_profiles')
            .upsert({
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone: phone,
              updated_at: new Date().toISOString()
            });
          
          if (profileErr && profileErr.code !== '23505') {
            console.warn('Profile table insert warning:', profileErr.message);
          }
        } catch (e) {
          console.warn('Gracefully handled manual profile insertion exception:', e);
        }
      }

      // Check if session was created automatically or email confirmation is needed
      if (data.session) {
        showToast('Account created and signed in successfully!');
        navigate('/account');
      } else {
        showToast('Registration successful! Please check your email inbox to verify your account.', 'success');
        navigate('/account/login');
      }

    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'Unable to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto px-5 py-12 md:py-20 flex items-center justify-center font-sans">
      <div className="max-w-[500px] w-full bg-white border border-beige p-6 md:p-8 rounded-[3px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] space-y-6 text-left">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-2xl font-black uppercase tracking-wider text-black">
            Create Account
          </h2>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            Register your premium boutique shopper account
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-accent/5 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fname" className="text-[9px] font-bold uppercase tracking-wider text-black/60">First Name *</label>
              <input 
                type="text" 
                id="fname" 
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lname" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Last Name *</label>
              <input 
                type="text" 
                id="lname" 
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Phone Number *</label>
              <input 
                type="tel" 
                id="phone" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Password (min 8 chars) *</label>
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

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cpassword" className="text-[9px] font-bold uppercase tracking-wider text-black/60">Confirm Password *</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="cpassword" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-beige text-xs py-2.5 px-3.5 outline-none focus:border-black rounded-[2px]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-[10px] font-bold tracking-widest uppercase py-3.5 mt-2 hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="border-t border-beige pt-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">
            Already have an account?{' '}
            <Link to="/account/login" className="text-accent hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
