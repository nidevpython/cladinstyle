import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- Database Products State ---
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // --- Fetch products from Supabase ---
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          product_images (
            id,
            image_url,
            is_primary,
            created_at
          ),
          product_sizes (
            id,
            size,
            stock
          )
        `);

      if (error) throw error;

      const mappedProducts = data.map(p => {
        const sortedImages = p.product_images?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || [];
        const primaryImg = sortedImages.find(img => img.is_primary)?.image_url || sortedImages[0]?.image_url || '';
        const imgList = sortedImages.map(img => img.image_url);

        return {
          id: p.id.toString(), // Ensure ID is a string for client app compatibility
          name: p.name,
          category: p.categories?.slug || 'baby',
          categoryName: p.categories?.name || 'Baby',
          price: Number(p.price),
          oldPrice: p.old_price ? Number(p.old_price) : null,
          discount: p.old_price && p.price ? Math.round(((Number(p.old_price) - Number(p.price)) / Number(p.old_price)) * 100) : null,
          sizes: p.product_sizes?.map(s => s.size) || [],
          sizeStock: p.product_sizes || [],
          colors: p.color ? p.color.split(',').map(c => c.trim()) : ['Default'],
          image: primaryImg,
          images: imgList,
          description: p.description || '',
          fabric: p.fabric || '',
          careInstructions: p.care_instructions || '',
          sku: p.sku || '',
          rating: p.rating || 4.5,
          stock: p.total_stock || 0,
          isNew: p.new_arrival || false,
          isBestSeller: p.best_seller || false,
          isActive: p.is_active || false
        };
      });

      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products from Supabase:', err);
      console.error("Product fetch error:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- Cart State ---
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('clad_react_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Wishlist State ---
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('clad_react_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // --- UI Drawers/Modals State ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // --- Product Transition State ---
  const [activeTransition, setActiveTransition] = useState(null);

  // --- Global Store Settings Branding Logo ---
  const [storeLogoUrl, setStoreLogoUrl] = useState('');

  useEffect(() => {
    const fetchStoreLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('store_logo_url')
          .eq('id', 1)
          .maybeSingle();

        if (error) {
          if (error.code === '42P01') {
            console.warn('store_settings table not initialized yet. Using default theme logo.');
          } else {
            console.error('Error loading store settings logo:', error);
          }
        } else if (data) {
          setStoreLogoUrl(data.store_logo_url || '');
        }
      } catch (err) {
        console.error('Error loading store settings logo in AppContext:', err);
      }
    };
    fetchStoreLogo();
  }, []);

  // --- Instagram Feed Config State (Admin Panel Preparation) ---
  const [instagramConfig, setInstagramConfig] = useState({
    profileUrl: 'https://www.instagram.com/clad_in_style_cis/',
    postCount: 20,
    autoSlide: true,
    slideSpeed: 1.2, // speed factor
    enabled: true
  });

  // --- Toast Alert State ---
  const [toast, setToast] = useState(null);

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem('clad_react_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('clad_react_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // --- Toast Trigger Function ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Auto hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Cart Operations ---
  const addToCart = (productId, size, color, quantity = 1) => {
    const matchedProduct = products.find(p => p.id === productId);
    if (!matchedProduct) return;

    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.id === productId && item.size === size && item.color === color
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        showToast(`Updated ${matchedProduct.name} quantity in Cart!`);
        return updated;
      }

      showToast(`Added ${matchedProduct.name} to Cart!`);
      return [...prev, {
        id: productId,
        name: matchedProduct.name,
        price: matchedProduct.price,
        image: matchedProduct.image,
        size,
        color,
        quantity
      }];
    });
  };

  const removeFromCart = (productId, size, color) => {
    setCart(prev => prev.filter(
      item => !(item.id === productId && item.size === size && item.color === color)
    ));
    showToast('Removed item from Cart.', 'info');
  };

  const updateCartQuantity = (productId, size, color, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item => {
      if (item.id === productId && item.size === size && item.color === color) {
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // --- Wishlist Operations ---
  const toggleWishlist = (productId) => {
    const matchedProduct = products.find(p => p.id === productId);
    if (!matchedProduct) return;

    setWishlist(prev => {
      const exists = prev.some(item => item.id === productId);
      if (exists) {
        showToast(`Removed ${matchedProduct.name} from Wishlist.`, 'info');
        return prev.filter(item => item.id !== productId);
      } else {
        showToast(`Saved ${matchedProduct.name} to Wishlist!`);
        return [...prev, {
          id: productId,
          name: matchedProduct.name,
          price: matchedProduct.price,
          image: matchedProduct.image
        }];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  // --- Customer Authentication State ---
  const [customer, setCustomer] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCustomer(session.user);
          const { data: profile, error: profErr } = await supabase
            .from('customer_profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profErr) throw profErr;
          setCustomerProfile(profile);
        }
      } catch (err) {
        console.error('Error fetching initial auth session / profile:', err);
      } finally {
        setLoadingCustomer(false);
      }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoadingCustomer(true);
      if (session?.user) {
        setCustomer(session.user);
        try {
          const { data: profile, error: profErr } = await supabase
            .from('customer_profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profErr) throw profErr;
          setCustomerProfile(profile);
        } catch (err) {
          console.error('Error loading customer profile on state change:', err);
          setCustomerProfile(null);
        }
      } else {
        setCustomer(null);
        setCustomerProfile(null);
      }
      setLoadingCustomer(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        products,
        loadingProducts,
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isMobileNavOpen,
        setIsMobileNavOpen,
        toast,
        showToast,
        closeToast,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartCount,
        getCartSubtotal,
        toggleWishlist,
        isInWishlist,
        activeTransition,
        setActiveTransition,
        instagramConfig,
        setInstagramConfig,
        customer,
        customerProfile,
        loadingCustomer,
        setCustomer,
        setCustomerProfile,
        storeLogoUrl,
        setStoreLogoUrl,
        fetchProducts
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
