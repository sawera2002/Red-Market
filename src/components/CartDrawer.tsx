import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
  appliedPromo: string;
  onApplyPromo: (code: string) => boolean;
  onRemovePromo: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
  appliedPromo,
  onApplyPromo,
  onRemovePromo
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountRate = appliedPromo.toUpperCase() === 'REDDEAL' ? 0.20 : 0;
  const discountAmount = subtotal * discountRate;
  const freeShippingThreshold = 35.0;
  const deliveryFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 3.99;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) return;

    const success = onApplyPromo(promoInput.trim());
    if (success) {
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code. Try "REDDEAL" for 20% off!');
    }
  };

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#11131a] border-l border-white/8 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Your Cart</h2>
                <p className="text-xs text-zinc-400">
                  {items.reduce((sum, i) => sum + i.quantity, 0)} items in basket
                </p>
              </div>
            </div>

            <button
              id="close-cart-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#181a24] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-[#151722] border-b border-white/6">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-zinc-300">
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Unlocked Free 30-min Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-red-400">${remainingForFreeShipping.toFixed(2)}</strong> more for{' '}
                    <strong>Free Delivery</strong>
                  </span>
                )}
              </span>
              <span className="text-zinc-500 text-[11px] font-mono">{Math.round(shippingProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#181a24] text-zinc-500 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Your cart is empty</h3>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Discover fresh fruits, prime meats, wild salmon, and artisanal sourdough to fill your bag.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  id={`cart-item-${product.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#171923] border border-white/6 hover:border-white/10 transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-zinc-800 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate" title={product.name}>
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400">{product.unit}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-black text-white">
                        ${(product.price * quantity).toFixed(2)}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 bg-[#0f1017] px-2 py-1 rounded-lg border border-white/8">
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          className="text-zinc-400 hover:text-white text-xs font-bold w-4 h-4 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-white px-1">{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="text-zinc-400 hover:text-white text-xs font-bold w-4 h-4 flex items-center justify-center disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 bg-[#151722] border-t border-white/8 space-y-4">
              {/* Promo Code Input */}
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-600/15 border border-red-500/30 text-xs">
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Coupon {appliedPromo} applied (20% OFF)</span>
                  </div>
                  <button
                    onClick={onRemovePromo}
                    className="text-zinc-400 hover:text-white text-xs underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code (e.g. REDDEAL)"
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0f1017] border border-white/10 rounded-lg text-white placeholder-zinc-500 uppercase tracking-wider font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#202330] hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-red-400 pl-1">{promoError}</p>
                  )}
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-400 font-medium">
                    <span>Discount (20% REDDEAL)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-400">
                  <span>Delivery Fee (Express 30m)</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/8 flex justify-between text-sm font-bold text-white">
                  <span>Estimated Total</span>
                  <span className="text-base text-white font-extrabold font-mono">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  id="proceed-checkout-btn"
                  onClick={onOpenCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#e50914] hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onClearCart}
                  className="w-full text-center text-zinc-400 hover:text-zinc-300 text-[11px] py-1 cursor-pointer"
                >
                  Clear Bag
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
