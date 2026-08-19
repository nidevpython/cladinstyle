import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Star, Heart, MapPin, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loadingProducts, addToCart, toggleWishlist, isInWishlist } = useApp();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);

  // PIN Code validator states
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // { type: 'success'|'error', msg }

  // Transition States
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [imageFadeState, setImageFadeState] = useState('opacity-100 scale-100');

  // Trigger reveal transition on component mount
  useEffect(() => {
    setIsLoaded(false);
    const frame = requestAnimationFrame(() => {
      setIsLoaded(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [id]);

  // Thumbnail change animation: fade + scale
  useEffect(() => {
    setImageFadeState('opacity-0 scale-[0.98]');
    const timer = setTimeout(() => {
      setImageFadeState('opacity-100 scale-100');
    }, 50);
    return () => clearTimeout(timer);
  }, [activeImage]);

  // Resolve matching product when ID params change
  useEffect(() => {
    if (loadingProducts) return;

    const matched = products.find(p => p.id === id);
    if (matched) {
      setProduct(matched);
      setActiveImage(matched.image);
      setSelectedSize(matched.sizes ? matched.sizes[0] : 'S');
      setSelectedColor(matched.colors ? matched.colors[0] : 'Default');
      setQty(1);
      setPincode('');
      setPincodeStatus(null);
    } else {
      setProduct(null);
    }
  }, [id, products, loadingProducts]);

  const handleBackNavigation = (url) => {
    setIsLeaving(true);
    setTimeout(() => {
      navigate(url);
    }, 350);
  };

  if (loadingProducts) {
    return (
      <div className="max-w-[1320px] mx-auto px-5 pt-10 pb-20 animate-pulse text-left">
        <div className="h-4 bg-beige w-1/4 mb-6 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 items-start">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_10fr] gap-3">
            <div className="flex flex-row md:flex-col gap-2 order-2 md:order-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-cream border border-beige shrink-0 w-16 md:w-full rounded" />
              ))}
            </div>
            <div className="aspect-[4/5] bg-cream border border-beige order-1 md:order-2 rounded" />
          </div>
          <div className="flex flex-col gap-5">
            <div className="h-4 bg-beige w-1/3 rounded" />
            <div className="h-8 bg-beige w-2/3 rounded" />
            <div className="h-6 bg-beige w-1/4 rounded" />
            <div className="h-10 bg-beige w-full rounded" />
            <div className="h-10 bg-beige w-1/2 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div 
        className={`max-w-[1320px] mx-auto px-5 py-40 text-center transition-all duration-300 ease-out ${
          isLeaving ? 'opacity-0 translate-y-[15px]' : 'opacity-100 translate-y-0'
        }`}
      >
        <h2 className="font-serif text-3xl font-bold mb-4">Product Not Found</h2>
        <p className="text-sm text-black/50 mb-8">The requested apparel details could not be loaded.</p>
        <Link to="/" onClick={(e) => { e.preventDefault(); handleBackNavigation('/'); }} className="inline-block bg-black text-white text-xs font-bold tracking-widest uppercase px-8 py-3.5 hover:bg-accent transition-colors">
          Go Back Home
        </Link>
      </div>
    );
  }

  // Related products recommendations (only show active products)
  const relatedList = products
    .filter(p => p.category === product.category && p.id !== product.id && p.isActive !== false)
    .slice(0, 4);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6 || isNaN(pincode)) {
      setPincodeStatus({
        type: 'error',
        msg: '✗ Please enter a valid 6-digit PIN code.'
      });
    } else {
      setPincodeStatus({
        type: 'success',
        msg: `✓ Delivery active for ${pincode}! Expected within 3 business days. COD active.`
      });
    }
  };

  const handleAddToCartClick = () => {
    addToCart(product.id, selectedSize, selectedColor, qty);
  };

  const handleBuyNowClick = () => {
    addToCart(product.id, selectedSize, selectedColor, qty);
    navigate('/checkout');
  };

  // Compile rating stars
  const renderStars = () => {
    const rating = product.rating || 4.5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < Math.floor(rating)) {
        stars.push(<Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />);
      } else {
        stars.push(<Star key={i} className="h-3 w-3 text-beige shrink-0" />);
      }
    }
    return stars;
  };

  return (
    <div 
      className={`max-w-[1320px] mx-auto px-5 pt-5 pb-20 transition-all duration-300 ease-out ${
        isLeaving ? 'opacity-0 translate-y-[15px]' : 'opacity-100 translate-y-0'
      }`}
    >
      
      {/* Breadcrumbs */}
      <nav className={`transition-all duration-500 ease-out delay-[50ms] text-[9px] font-bold tracking-widest uppercase text-black/40 mb-6 text-left ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[15px]'
      }`}>
        <Link to="/" onClick={(e) => { e.preventDefault(); handleBackNavigation('/'); }} className="hover:text-black">Home</Link> /{' '}
        <Link 
          to={product.category === 'baby' ? '/baby' : '/women'} 
          onClick={(e) => { e.preventDefault(); handleBackNavigation(product.category === 'baby' ? '/baby' : '/women'); }}
          className="hover:text-black"
        >
          {product.category === 'baby' ? 'Baby Boutique' : 'Women Collection'}
        </Link>{' '}
        / <span className="text-black">{product.name}</span>
      </nav>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 items-start">
        
        {/* Left Side: Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_10fr] gap-3">
          {/* Thumbnails */}
          <div className="flex flex-row md:flex-col gap-2 order-2 md:order-1">
            <button 
              onClick={() => setActiveImage(product.image)}
              className={`aspect-[4/5] overflow-hidden border ${
                activeImage === product.image ? 'border-black' : 'border-beige'
              } bg-cream shrink-0 w-16 md:w-full`}
            >
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </button>
            {product.images?.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`aspect-[4/5] overflow-hidden border ${
                  activeImage === img ? 'border-black' : 'border-beige'
                } bg-cream shrink-0 w-16 md:w-full`}
              >
                <img src={img} alt={product.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Display Frame */}
          <div className="aspect-[4/5] overflow-hidden border border-beige bg-cream order-1 md:order-2">
            <img 
              src={activeImage} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-all duration-[800ms] ease-out ${imageFadeState} ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-104'
              }`} 
            />
          </div>
        </div>

        {/* Right Side: Product Configuration Info */}
        <div className="text-left flex flex-col gap-5">
          
          <div>
            <span className={`text-[10px] font-bold text-accent tracking-[0.25em] uppercase block transition-all duration-600 ease-out delay-[100ms] ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[25px]'
            }`}>
              {product.category === 'baby' ? "Baby's Boutique" : "Women's Collection"}
            </span>
            <h2 className={`font-serif text-2xl md:text-[26px] font-bold uppercase tracking-wide leading-tight text-black mt-1 transition-all duration-600 ease-out delay-[180ms] ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[25px]'
            }`}>
              {product.name}
            </h2>
            <div className={`flex items-center gap-2 mt-2 transition-all duration-600 ease-out delay-[260ms] ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[25px]'
            }`}>
              <div className="flex">{renderStars()}</div>
              <span className="text-[11px] font-bold text-black/60">
                {product.rating} ({product.stock + 15} Reviews)
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-3 border-b border-beige pb-4 transition-all duration-600 ease-out delay-[340ms] ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[25px]'
          }`}>
            <span className="text-2xl font-black">₹{product.price.toLocaleString()}</span>
            {product.oldPrice && (
              <>
                <span className="text-sm text-black/45 line-through">₹{product.oldPrice.toLocaleString()}</span>
                <span className="text-[11px] font-bold text-accent tracking-wider uppercase">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Size Selectors */}
          {product.sizes && (
            <div className={`transition-all duration-600 ease-out delay-[420ms] ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[25px]'
            }`}>
              <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase mb-2.5">
                <span>Select Size</span>
                <button onClick={() => alert('Sizing chart references details.')} className="text-accent hover:underline">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border text-xs font-bold px-4 py-2 uppercase transition-all ${
                      selectedSize === size ? 'bg-black text-white border-black' : 'border-beige hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selectors */}
          {product.colors && product.colors[0] !== 'Default' && (
            <div className={`transition-all duration-600 ease-out delay-[500ms] ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[25px]'
            }`}>
              <span className="block text-[10px] font-bold tracking-widest uppercase mb-2.5">Select Color</span>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`border text-[11px] font-semibold px-3.5 py-1.5 uppercase transition-all ${
                      selectedColor === color ? 'bg-black text-white border-black' : 'border-beige hover:border-black'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Wishlist */}
          <div className={`transition-all duration-600 ease-out delay-[580ms] ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[25px]'
          }`}>
            <span className="block text-[10px] font-bold tracking-widest uppercase mb-2.5">Quantity</span>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center border border-beige h-11">
                <button 
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 text-lg hover:bg-cream"
                >
                  -
                </button>
                <span className="text-sm font-bold min-[40px]:px-4 text-center">{qty}</span>
                <button 
                  onClick={() => setQty(prev => prev + 1)}
                  className="w-10 h-10 text-lg hover:bg-cream"
                >
                  +
                </button>
              </div>

              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`border border-beige h-11 w-11 flex items-center justify-center transition-colors hover:border-black ${
                  isInWishlist(product.id) ? 'border-accent bg-accent/5 text-accent' : 'text-black'
                }`}
                aria-label="Add to Wishlist"
              >
                <Heart className={`h-4.5 w-4.5 ${isInWishlist(product.id) ? 'fill-accent' : ''}`} />
              </button>
            </div>
          </div>

          {/* CTA Actions */}
          <div className={`grid grid-cols-2 gap-4 mt-1.5 transition-all duration-600 ease-out delay-[660ms] ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[25px]'
          }`}>
            <button 
              onClick={handleAddToCartClick}
              className="border border-black text-black text-[11px] font-bold tracking-widest uppercase py-3.5 hover:bg-cream transition-colors"
            >
              Add to Bag
            </button>
            <button 
              onClick={handleBuyNowClick}
              className="bg-black text-white text-[11px] font-bold tracking-widest uppercase py-3.5 hover:bg-black/90 transition-colors"
            >
              Buy It Now
            </button>
          </div>

          {/* Pin code checker */}
          <div className="border border-beige bg-cream p-4 mt-2">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase mb-3">
              <MapPin className="h-4 w-4" />
              <span>Check Delivery Availability</span>
            </div>
            <form onSubmit={handlePincodeCheck} className="flex gap-2.5">
              <input 
                type="text" 
                maxLength={6} 
                placeholder="Enter 6-Digit PIN Code" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-grow bg-white border border-beige text-xs py-2 px-3 outline-none focus:border-black"
              />
              <button type="submit" className="bg-black text-white text-[10px] font-bold tracking-wider uppercase px-5 py-2.5">
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className={`text-[10px] font-bold tracking-wider uppercase mt-2.5 ${
                pincodeStatus.type === 'success' ? 'text-green-700' : 'text-accent'
              }`}>
                {pincodeStatus.msg}
              </p>
            )}
          </div>

          {/* Specifications table */}
          <div className={`border-t border-beige pt-5 flex flex-col gap-4 transition-all duration-600 ease-out delay-[740ms] ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[25px]'
          }`}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3.5 text-xs text-black/80">
              <div>
                <span className="block text-[9px] font-bold tracking-widest uppercase text-black/40">Fabric</span>
                <span className="font-semibold text-black">{product.fabric}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold tracking-widest uppercase text-black/40">Fit</span>
                <span className="font-semibold text-black">Premium Regular / Standard</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[9px] font-bold tracking-widest uppercase text-black/40">Description</span>
                <span className="block font-medium text-black/85 leading-relaxed mt-1 text-[11px]">
                  {product.description}
                </span>
              </div>
            </div>

            {/* Bullets shipping returns guidelines */}
            <ul className="flex flex-col gap-2 border-t border-black/5 pt-4 text-[10px] font-bold tracking-wider uppercase text-black/60 list-none p-0 m-0">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>100% Skin friendly baby-safe textiles</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>Dispatched within 24 Hours</span>
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>Easy 7 Days returns & exchanges</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Recommended Items Grid */}
      {relatedList.length > 0 && (
        <div className="border-t border-beige pt-10 mt-10 text-left">
          <h3 className="font-serif text-lg font-bold tracking-wider uppercase text-black mb-6">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedList.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
