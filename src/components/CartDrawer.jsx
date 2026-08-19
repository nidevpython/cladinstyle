import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    getCartSubtotal
  } = useApp();

  const navigate = useNavigate();

  const subtotal = getCartSubtotal();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className={`fixed inset-0 z-80 bg-black/50 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 z-90 h-full w-full max-w-[420px] bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-beige">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4.5 w-4.5" />
            <h3 className="text-xs font-bold tracking-widest uppercase">Shopping Bag</h3>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-1 hover:text-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Items */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <ShoppingBag className="h-10 w-10 text-beige" />
              <p className="font-serif text-base font-semibold">Your bag is empty.</p>
              <p className="text-[11px] text-black/50">Explore our boutique collections to select designs.</p>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/women');
                }} 
                className="mt-2 bg-black text-white text-[9px] font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-accent transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 border-b border-cream pb-4 last:border-0 last:pb-0">
                <div className="w-[70px] aspect-[4/5] bg-cream overflow-hidden border border-beige shrink-0">
                  <img src={item.image} alt={item.name} className="w-100 h-100 object-cover" />
                </div>
                
                <div className="flex-grow flex flex-col justify-between text-left">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-[11px] font-bold leading-tight line-clamp-1">{item.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item.id, item.size, item.color)} 
                        className="text-black/35 hover:text-accent transition-colors shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[9px] text-black/55 uppercase font-medium mt-0.5">
                      Size: {item.size} {item.color !== 'Default' ? `| Color: ${item.color}` : ''}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="inline-flex items-center border border-beige">
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.size, item.color, item.quantity - 1)}
                        className="px-2.5 py-0.5 text-xs text-black/60 hover:bg-cream"
                      >
                        -
                      </button>
                      <span className="text-[11px] font-bold min-width-[20px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.size, item.color, item.quantity + 1)}
                        className="px-2.5 py-0.5 text-xs text-black/60 hover:bg-cream"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[11px] font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="bg-cream border-t border-beige p-5">
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[11px] text-black/80 font-medium">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-black/80 font-medium">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-[9px] font-bold text-accent uppercase tracking-wider text-left">
                  Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping!
                </p>
              )}
              <div className="flex justify-between text-xs font-bold text-black border-t border-beige pt-3 mt-1">
                <span>Estimated Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckoutClick}
              className="w-100 bg-black text-white text-[10px] font-bold tracking-widest uppercase py-3.5 flex items-center justify-center gap-1.5 hover:bg-accent transition-colors"
            >
              Checkout →
            </button>
          </div>
        )}

      </div>
    </>
  );
}
