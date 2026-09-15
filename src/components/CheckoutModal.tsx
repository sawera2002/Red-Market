import React, { useState } from 'react';
import { X, MapPin, Phone, User, CreditCard, Banknote, ShieldCheck, Sparkles, Loader2, Truck } from 'lucide-react';
import { CartItem, CustomerInfo, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  defaultAddress: string;
  appliedPromo: string;
  onOrderSuccess: (savedOrder: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  defaultAddress,
  appliedPromo,
  onOrderSuccess
}) => {
  const [fullName, setFullName] = useState('Sarah Jenkins');
  const [email, setEmail] = useState('sarah.j@example.com');
  const [phone, setPhone] = useState('(555) 349-8201');
  const [address, setAddress] = useState(defaultAddress || '742 Evergreen Terrace');
  const [aptSuite, setAptSuite] = useState('Apt 4B');
  const [city, setCity] = useState('Springfield');
  const [instructions, setInstructions] = useState('Leave in front porch chill box please.');
  const [deliverySpeed, setDeliverySpeed] = useState<'express_30' | 'standard_60'>('express_30');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'redpay'>('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discountRate = appliedPromo.toUpperCase() === 'REDDEAL' ? 0.20 : 0;
  const discountAmount = subtotal * discountRate;
  const deliveryFee = subtotal >= 35.0 ? 0 : deliverySpeed === 'express_30' ? 3.99 : 1.99;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('Please fill in your Name, Phone Number, and Delivery Address.');
      return;
    }

    setIsSubmitting(true);

    const customerData: CustomerInfo = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      aptSuite: aptSuite.trim(),
      city: city.trim(),
      instructions: instructions.trim(),
      deliverySpeed,
      paymentMethod
    };

    const payload = {
      customer: customerData,
      items: cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        unit: item.product.unit,
        image: item.product.image,
        quantity: item.quantity
      })),
      subtotal,
      discount: discountAmount,
      promoCode: appliedPromo || undefined,
      deliveryFee,
      total
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order in backend');
      }

      // Successfully saved in backend!
      onOrderSuccess(data.order);
      onClose();
    } catch (err: unknown) {
      console.error('Order submission error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not save order to backend. Please check server.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="checkout-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#11131b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-white/8 flex items-center justify-between bg-[#151722]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Express Checkout</h2>
              <p className="text-xs text-zinc-400">
                Order will be saved directly to backend & scheduled for delivery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a1c27] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Customer & Delivery Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>1. Contact & Customer Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2 text-xs bg-[#171924] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Phone Number (For driver) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3.5 py-2 text-xs bg-[#171924] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Email (Order receipt & tracking)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2 text-xs bg-[#171924] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-4 pt-2 border-t border-white/6">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>2. Delivery Destination</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="742 Evergreen Terrace"
                  className="w-full px-3.5 py-2 text-xs bg-[#171924] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Apt / Unit / Floor
                </label>
                <input
                  type="text"
                  value={aptSuite}
                  onChange={(e) => setAptSuite(e.target.value)}
                  placeholder="Apt 4B"
                  className="w-full px-3.5 py-2 text-xs bg-[#171924] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Springfield"
                  className="w-full px-3.5 py-2 text-xs bg-[#171924] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Drop-off Instructions
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Leave at door in chill bag, don't ring bell"
                  className="w-full px-3.5 py-2 text-xs bg-[#171924] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Speed & Payment Method */}
          <div className="space-y-4 pt-2 border-t border-white/6">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" />
              <span>3. Delivery Speed & Payment Method</span>
            </h3>

            {/* Delivery Speed Choices */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliverySpeed('express_30')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  deliverySpeed === 'express_30'
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-white/8 bg-[#171924] text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span>🚀 30-Min Express</span>
                  <span className="text-[10px] text-red-400 font-mono font-bold">Fastest</span>
                </div>
                <p className="text-[11px] text-zinc-400">Guaranteed within 30 minutes in chill box</p>
              </button>

              <button
                type="button"
                onClick={() => setDeliverySpeed('standard_60')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  deliverySpeed === 'standard_60'
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-white/8 bg-[#171924] text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span>🌿 Standard Delivery</span>
                  <span className="text-[10px] text-zinc-400">45-60 min</span>
                </div>
                <p className="text-[11px] text-zinc-400">Standard scheduled delivery slot</p>
              </button>
            </div>

            {/* Payment Method Choices */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-white/8 bg-[#171924] text-zinc-400'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400 mb-1" />
                <div className="text-xs font-bold text-white">Cash on Delivery</div>
                <div className="text-[10px] text-zinc-400">Pay when arrived</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'card'
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-white/8 bg-[#171924] text-zinc-400'
                }`}
              >
                <CreditCard className="w-4 h-4 text-red-400 mb-1" />
                <div className="text-xs font-bold text-white">Credit / Debit Card</div>
                <div className="text-[10px] text-zinc-400">Encrypted checkout</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('redpay')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'redpay'
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-white/8 bg-[#171924] text-zinc-400'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
                <div className="text-xs font-bold text-white">RedPay 1-Click</div>
                <div className="text-[10px] text-zinc-400">Instant digital pass</div>
              </button>
            </div>
          </div>

          {/* Items & Price Breakdown */}
          <div className="p-4 rounded-xl bg-[#171924] border border-white/8 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold mb-2 pb-2 border-b border-white/6">
              <span>{cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items Ordered</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-red-400 font-medium">
                <span>20% Discount ({appliedPromo})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-zinc-400">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `$${deliveryFee.toFixed(2)}`}</span>
            </div>

            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/8">
              <span>Final Total to Pay</span>
              <span className="text-lg text-white font-mono font-black">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Back to Bag
            </button>

            <button
              id="confirm-place-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#e50914] hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 active:scale-98 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Order to Backend...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Save Order to Backend (${total.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
