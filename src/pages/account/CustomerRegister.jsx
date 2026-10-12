import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../supabase';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';

export default function CustomerRegister() {
  const { customer, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.from || location.state?.returnTo || '/account';

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

  // Verification prompt state
  const [isVerificationRequired, setIsVerificationRequired] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (customer) {
      navigate(returnTo, { replace: true });
    }
  }, [customer, returnTo, navigate]);

  const validateForm = () => {
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return false;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return false;
    }
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
    setIsVerificationRequired(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanPhone = phone.trim();

    try {
      // 1. SignUp in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            phone: cleanPhone
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered') || error.code === 'user_already_exists') {
          throw new Error('This email address is already registered. Please sign in or reset your password.');
        } else if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
          throw new Error('Registration rate limit reached. Please wait a few minutes before trying again.');
        } else {
          throw error;
        }
      }

      // Check if user already exists (Supabase enumeration protection returns empty identities array)
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('An account with this email address already exists. Please sign in or reset your password.');
      }

      let activeUser = data?.user;
      let activeSession = data?.session;

      // 2. If immediate session wasn't returned by signUp, attempt instant signInWithPassword
      // This immediately logs the user in if email confirmation is disabled or auto-confirmed in DB
      if (!activeSession && activeUser) {
        try {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });
          if (signInData?.session) {
            activeSession = signInData.session;
            activeUser = signInData.user;
          }
        } catch {
          // If signIn fails (e.g. email confirmation required), proceed to verification branch
        }
      }

      // 3. If an authenticated session is active, sync profile and redirect immediately
      if (activeSession && activeUser) {
        try {
          await supabase
            .from('customer_profiles')
            .upsert({
              id: activeUser.id,
              first_name: cleanFirstName,
              last_name: cleanLastName,
              email: cleanEmail,
              phone: cleanPhone,
              updated_at: new Date().toISOString()
            });
        } catch (e) {
          console.warn('Customer profile upsert note:', e);
        }

        showToast('Account created and signed in successfully!');
        navigate(returnTo, { replace: true });
        return;
      }

      // 4. Otherwise, email verification is required by the Supabase project configuration
      setRegisteredEmail(cleanEmail);
      setIsVerificationRequired(true);
      showToast('Account created successfully. Please verify your email before signing in.', 'info');

    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'Unable to register account.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail
      });
      if (error) throw error;
      setResendSuccess(true);
      showToast('Verification email resent! Please check your inbox and spam folder.', 'success');
    } catch (err) {
      console.error('Resend email error:', err);
      showToast(err.message || 'Unable to resend verification email.', 'error');
    } finally {
      setResending(false);
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

        {/* Main Content: Verification Required Notice or Registration Form */}
        {isVerificationRequired ? (
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <Mail className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-black">
                Verify Your Email
              </h3>
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 mt-3 rounded-sm leading-relaxed">
                Account created successfully. Please verify your email before signing in.
              </p>
              
              <div className="mt-4 p-3.5 bg-cream/60 border border-beige rounded-sm text-left text-xs">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-black/50">Verification link sent to:</span>
                <span className="font-bold text-black text-xs break-all block mt-0.5">{registeredEmail}</span>
              </div>

              <p className="text-[11px] text-black/60 mt-3 leading-relaxed">
                Please check your inbox (and spam folder) and click the verification link. Once verified, you can immediately sign in.
              </p>
            </div>

            {resendSuccess && (
              <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-[11px] font-semibold rounded-sm">
                ✓ A fresh verification email has been sent!
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Link
                to="/account/login"
                state={{ 
                  registeredEmail,
                  from: returnTo,
                  infoMsg: 'Account created successfully. Please verify your email before signing in.' 
                }}
                className="w-full bg-black text-white text-[10px] font-bold tracking-widest uppercase py-3.5 hover:bg-accent transition-colors block text-center rounded-sm"
              >
                Proceed to Sign In
              </Link>

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full bg-cream text-black border border-beige text-[10px] font-bold tracking-widest uppercase py-2.5 hover:border-black transition-colors rounded-sm cursor-pointer disabled:opacity-50"
              >
                {resending ? 'Sending Verification Link...' : 'Resend Verification Email'}
              </button>
            </div>
          </div>
        ) : (
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
        )}

        {/* Footer Link to Login */}
        <div className="border-t border-beige pt-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">
            Already have an account?{' '}
            <Link to="/account/login" state={{ from: returnTo }} className="text-accent hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
