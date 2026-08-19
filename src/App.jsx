import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminHomepage from './pages/admin/AdminHomepage';
import AdminSettings from './pages/admin/AdminSettings';
import AdminInstagram from './pages/admin/AdminInstagram';
import { isSupabaseConfigured } from './supabase';

// Customer Account Imports
import AccountDashboard from './pages/account/AccountDashboard';
import CustomerLogin from './pages/account/CustomerLogin';
import CustomerRegister from './pages/account/CustomerRegister';
import CustomerForgotPassword from './pages/account/CustomerForgotPassword';
import CustomerResetPassword from './pages/account/CustomerResetPassword';
import OrderTracking from './pages/account/OrderTracking';

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center font-sans p-5 text-center">
        <h2 className="font-serif text-2xl uppercase tracking-wider text-black">
          Supabase Configuration Missing
        </h2>
        <div className="w-12 h-[2px] bg-accent my-4" />
        <p className="text-xs text-black/60 max-w-sm leading-relaxed mb-6">
          Please configure <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> in your <code>.env</code> file in the project root.
        </p>
        <div className="bg-white border border-beige p-4 text-[10px] font-mono text-left max-w-xs sm:max-w-sm w-full space-y-1">
          <div># Example .env configuration</div>
          <div>VITE_SUPABASE_URL=https://your-project-id.supabase.co</div>
          <div>VITE_SUPABASE_ANON_KEY=your-anon-public-key</div>
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Admin panel routes */}
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="homepage" element={<AdminHomepage />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="instagram" element={<AdminInstagram />} />
          </Route>

          {/* Customer boutique store routes */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="baby" element={<Shop type="baby" />} />
            <Route path="women" element={<Shop type="women" />} />
            <Route path="new-arrivals" element={<Shop type="new" />} />
            <Route path="best-sellers" element={<Shop type="best" />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            
            {/* Customer account routes */}
            <Route path="account" element={<AccountDashboard />} />
            <Route path="account/login" element={<CustomerLogin />} />
            <Route path="account/register" element={<CustomerRegister />} />
            <Route path="account/forgot-password" element={<CustomerForgotPassword />} />
            <Route path="account/reset-password" element={<CustomerResetPassword />} />
            <Route path="account/orders/:orderId" element={<OrderTracking />} />

            {/* Fallback redirect */}
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
