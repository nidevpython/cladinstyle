import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut, Key, Check, ShieldCheck } from 'lucide-react';
import logoFallback from '../../assets/images/clad-in-style-logo.png';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { showToast, storeLogoUrl, setStoreLogoUrl } = useApp();

  const [adminEmail, setAdminEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoCacheBuster, setLogoCacheBuster] = useState(Date.now());

  useEffect(() => {
    const initSettings = async () => {
      // Fetch profile email
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email);
      }
    };
    initSettings();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please populate all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and password confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showToast('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password reset failed:', err);
      setErrorMsg(err.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showToast('Logged out successfully.');
      navigate('/admin/login');
    } catch (err) {
      showToast('Logout failed: ' + err.message, 'error');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid file format. Please upload PNG, JPG, JPEG, or WEBP.', 'error');
      return;
    }

    // Check file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('File is too large. Maximum size is 2MB.', 'error');
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `branding/store-logo.${fileExt}`;

      // Upload file to store-assets bucket
      const { error: uploadErr } = await supabase.storage
        .from('store-assets')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadErr) {
        console.error('Supabase storage upload error details:', uploadErr);
        if (uploadErr.message && uploadErr.message.includes('Bucket not found')) {
          throw new Error("Storage bucket 'store-assets' not found. Please create it manually in your Supabase dashboard.");
        }
        throw uploadErr;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(fileName);

      // Save to store_settings table
      const { error: dbErr } = await supabase
        .from('store_settings')
        .upsert({
          id: 1,
          store_logo_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (dbErr) {
        console.error('Store settings DB update error:', dbErr);
        throw dbErr;
      }

      setStoreLogoUrl(publicUrl);
      setLogoCacheBuster(Date.now()); // Bust the preview component image cache
      showToast('Store logo updated successfully.');
    } catch (err) {
      console.error('Store logo update failure:', err);
      showToast('Logo upload failed: ' + (err.message || 'Unknown database error'), 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-[800px] mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-black uppercase tracking-wider text-black">
          Settings
        </h1>
        <p className="text-xs text-black/50 mt-1 font-semibold uppercase tracking-wider">
          Manage your administrator profile credentials and login preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white border border-beige p-6 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] flex flex-col justify-between items-start h-56 text-left">
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-accent tracking-widest uppercase">Admin Profile</span>
            <div className="flex items-center gap-2 text-black mt-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold border border-accent/35 shrink-0">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-bold text-black truncate max-w-[150px]">{adminEmail}</span>
            </div>
            <span className="block text-[10px] text-green-700 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-[2px] w-max uppercase tracking-wider mt-3">
              Authorized Admin
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-black hover:bg-accent hover:text-white hover:border-accent text-black text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-[2px] transition-all w-full justify-center"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout Session</span>
          </button>
        </div>

        {/* Change Password Card */}
        <div className="bg-white border border-beige p-6 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] md:col-span-2 text-left">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-4 flex items-center gap-2">
            <Key className="h-4 w-4 text-accent" />
            <span>Update Password</span>
          </h3>

          {errorMsg && (
            <div className="mb-4 p-3 bg-accent/5 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cream/35 border border-beige px-3 py-2 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cream/35 border border-beige px-3 py-2 text-xs outline-none focus:border-black rounded-[3px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-accent transition-all rounded-[3px] disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {loading ? (
                <span>Updating...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Store Branding Card */}
        <div className="bg-white border border-beige p-6 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.01)] md:col-span-3 text-left">
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black border-b border-beige pb-3 mb-4 flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-accent" />
            <span>Store Branding</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Logo Preview */}
            <div className="space-y-3">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-black/50">Current Logo Preview</span>
              <div className="border border-beige p-4 bg-cream/15 rounded-[3px] flex items-center justify-center h-40 overflow-hidden">
                {storeLogoUrl ? (
                  <img
                    src={`${storeLogoUrl}?t=${logoCacheBuster}`}
                    alt="Store Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <img
                      src={logoFallback}
                      alt="Default Logo"
                      className="max-h-24 max-w-full object-contain opacity-40"
                    />
                    <span className="text-[9px] text-black/45 font-bold uppercase tracking-wider">Default Theme Logo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Logo Upload Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Upload New Logo</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="w-full text-xs text-black/60 file:mr-4 file:py-2 file:px-4 file:rounded-[2px] file:border-0 file:text-[9.5px] file:font-bold file:uppercase file:tracking-wider file:bg-cream file:text-black hover:file:bg-beige file:cursor-pointer cursor-pointer border border-beige p-2.5 rounded-[3px] bg-cream/15"
                />
                <span className="block text-[9.5px] text-black/40 mt-2 font-semibold leading-relaxed">
                  Allowed formats: PNG, JPG, JPEG, WEBP. Maximum file size: 2MB.
                </span>
              </div>

              {uploadingLogo && (
                <div className="text-[10px] text-black/50 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                  <span>Uploading store logo...</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
