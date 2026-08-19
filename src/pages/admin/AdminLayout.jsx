import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  ClipboardList,
  FolderTree,
  Home as HomeIcon,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  User,
  ShieldAlert,
  Camera
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          navigate('/admin/login');
          return;
        }

        setAdminEmail(session.user.email);

        // Verify admin permissions
        // 1. Call RPC function is_admin()
        const { data: rpcIsAdmin, error: rpcError } = await supabase.rpc('is_admin');
        
        // 2. Query admin_users table directly
        const { data: adminRecord, error: adminTableError } = await supabase
          .from('admin_users')
          .select('id, role')
          .eq('id', session.user.id)
          .single();

        if (rpcIsAdmin || adminRecord) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          // Auto signout from browser if not authorized in db
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.error('Authorization check failed:', err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate, location.pathname]);

  const [newCount, setNewCount] = useState(0);

  const fetchUnviewedCount = async () => {
    try {
      // Use select('*') so it dynamically adapts to whatever columns exist in the DB,
      // preventing PostgREST column-not-found 400 Bad Request errors in the console.
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', '2026-08-19T23:28:00Z');

      if (error) {
        console.warn('Unable to query orders (table or column may be missing):', error.message);
        setNewCount(0);
        return;
      }
      
      const unviewed = (data || []).filter(o => o.admin_seen_at === null || o.admin_seen_at === undefined);
      setNewCount(unviewed.length);
    } catch (err) {
      console.error('Error fetching unviewed orders count:', err);
      setNewCount(0);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchUnviewedCount();

      // Realtime subscription for all orders events
      const ordersChannel = supabase
        .channel('realtime_orders_count')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchUnviewedCount();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(ordersChannel);
      };
    }
  }, [authorized]);

  // Layout navigation items mapping

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

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <h1 className="font-serif text-2xl uppercase tracking-[0.25em] text-black">
            Verifying Admin Session
          </h1>
          <div className="w-16 h-[2px] bg-accent" />
          <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  // Unauthorized Screen
  if (!authorized) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-5 font-sans">
        <div className="max-w-md w-full bg-white border border-beige p-8 text-center rounded-[3px]">
          <ShieldAlert className="h-12 w-12 text-accent mx-auto mb-4" />
          <h1 className="font-serif text-2xl uppercase tracking-wider text-black mb-2">
            Access Denied
          </h1>
          <p className="text-xs text-black/60 leading-relaxed mb-6">
            You do not have administrative privileges for Clad in Style Boutique.
          </p>
          <button
            onClick={() => navigate('/admin/login')}
            className="inline-flex items-center gap-2 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-6 py-3 hover:bg-accent transition-colors rounded-[3px]"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Homepage', path: '/admin/homepage', icon: HomeIcon },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
    { name: 'Instagram', path: '/admin/instagram', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-cream flex font-sans text-text">
      
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex flex-col justify-between w-[260px] bg-black text-white shrink-0 sticky top-0 h-screen border-r border-white/10">
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-white/10 text-left">
            <h2 className="font-serif text-lg font-black uppercase tracking-[0.18em]">
              Clad In Style
            </h2>
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-accent">
              Admin Panel
            </span>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="p-4 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between w-full px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-[2px] transition-colors ${
                    isActive
                      ? 'bg-accent text-white font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.name}</span>
                  </div>
                  {item.name === 'Orders' && newCount > 0 && (
                    <span className="bg-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center border border-white/20">
                      {newCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Profile */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 px-2 text-left">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold border border-accent/35 shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-[8px] font-bold text-white/40 uppercase tracking-wider">
                Administrator
              </span>
              <span className="block text-[10px] font-bold text-white/90 truncate max-w-[150px]">
                {adminEmail}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full border border-white/10 text-white/70 text-[10px] font-bold tracking-widest uppercase py-2.5 hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 rounded-[2px]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 z-80 bg-black/60 transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        className={`fixed top-0 left-0 z-90 h-full w-[260px] bg-black text-white p-5 flex flex-col justify-between transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/10 text-left">
            <div>
              <h2 className="font-serif text-base font-black uppercase tracking-wider">
                Clad In Style
              </h2>
              <span className="text-[8px] font-bold tracking-widest uppercase text-accent">
                Admin Panel
              </span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between w-full px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-[2px] ${
                    isActive ? 'bg-accent text-white font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.name}</span>
                  </div>
                  {item.name === 'Orders' && newCount > 0 && (
                    <span className="bg-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center border border-white/20">
                      {newCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold border border-accent/35 shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-[8px] font-bold text-white/40 uppercase tracking-wider">
                Administrator
              </span>
              <span className="block text-[10px] font-bold text-white/90 truncate max-w-[150px]">
                {adminEmail}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full border border-white/10 text-white/70 text-[10px] font-bold tracking-widest uppercase py-2.5 hover:bg-accent hover:text-white transition-all rounded-[2px]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Mobile Header Toolbar */}
        <header className="lg:hidden bg-white border-b border-beige h-14 flex items-center justify-between px-5 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-left">
            <h2 className="font-serif text-sm font-black uppercase tracking-wider text-black">
              Clad In Style
            </h2>
            <span className="text-[8px] font-bold uppercase tracking-wider text-accent">
              Admin
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 hover:text-accent transition-colors"
            aria-label="Open Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Content View Outlet */}
        <main className="flex-grow p-5 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
