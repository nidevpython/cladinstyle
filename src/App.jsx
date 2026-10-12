import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import { isSupabaseConfigured } from './supabase';

// Lazy-loaded Storefront & Account Routes
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const GiftCards = lazy(() => import('./pages/GiftCards'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const FAQs = lazy(() => import('./pages/FAQs'));
const SizeGuide = lazy(() => import('./pages/SizeGuide'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));

// Lazy-loaded Customer Account Routes
const AccountDashboard = lazy(() => import('./pages/account/AccountDashboard'));
const CustomerLogin = lazy(() => import('./pages/account/CustomerLogin'));
const CustomerRegister = lazy(() => import('./pages/account/CustomerRegister'));
const CustomerForgotPassword = lazy(() => import('./pages/account/CustomerForgotPassword'));
const CustomerResetPassword = lazy(() => import('./pages/account/CustomerResetPassword'));
const OrderTracking = lazy(() => import('./pages/account/OrderTracking'));

// Lazy-loaded Admin Panel Routes
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminHomepage = lazy(() => import('./pages/admin/AdminHomepage'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminInstagram = lazy(() => import('./pages/admin/AdminInstagram'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-beige border-t-black rounded-full animate-spin" />
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
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
              
              {/* Boutique Customer Service, Policies, and Gift Cards */}
              <Route path="gift-cards" element={<GiftCards />} />
              <Route path="giftcards" element={<GiftCards />} />
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="track" element={<TrackOrder />} />
              <Route path="shipping-policy" element={<ShippingPolicy />} />
              <Route path="shipping" element={<ShippingPolicy />} />
              <Route path="faqs" element={<FAQs />} />
              <Route path="faq" element={<FAQs />} />
              <Route path="size-guide" element={<SizeGuide />} />
              <Route path="sizeguide" element={<SizeGuide />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="terms-conditions" element={<TermsConditions />} />
              <Route path="terms" element={<TermsConditions />} />
              
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
        </Suspense>
      </Router>
    </AppProvider>
  );
}
