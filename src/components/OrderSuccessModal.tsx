import React from 'react';
import { CheckCircle2, Clock, MapPin, Package, ArrowRight, Database } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewBackendOrders: () => void;
  isAdmin?: boolean;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewBackendOrders,
  isAdmin = false
}) => {
  if (!order) return null;

  return (
    <div id="order-success-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#11131b] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-center my-8 animate-in fade-in zoom-in duration-200">
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
          ✓ Persisted to Backend Database
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          Order Placed Successfully!
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Thank you, <strong className="text-white">{order.customer.fullName}</strong>. Your harvest is being packed.
        </p>

        {/* Order Identifier & Delivery ETA Card */}
        <div className="mt-5 p-4 rounded-xl bg-[#171924] border border-white/8 text-left space-y-3">
          <div className="flex items-center justify-between border-b border-white/6 pb-2.5">
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Order Reference</span>
              <span className="text-sm font-black text-white font-mono tracking-wider text-red-400">
                {order.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-zinc-400 block font-medium">Estimated Arrival</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {order.estimatedDelivery}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-zinc-300">
            <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">
                {order.customer.address}
                {order.customer.aptSuite ? `, ${order.customer.aptSuite}` : ''}
              </p>
              <p className="text-zinc-400 text-[11px]">{order.customer.city} • {order.customer.phone}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/6 flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              {order.items.length} items • Total Paid
            </span>
            <span className="text-sm font-extrabold text-white font-mono">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Ordered Items Preview */}
        <div className="mt-4 text-left max-h-36 overflow-y-auto pr-1 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#14161f]">
              <div className="flex items-center gap-2 truncate">
                <Package className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <span className="text-zinc-200 truncate">{item.name}</span>
                <span className="text-zinc-400">×{item.quantity}</span>
              </div>
              <span className="text-zinc-300 font-mono font-bold">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {isAdmin ? (
            <>
              <button
                id="view-backend-orders-btn"
                onClick={onViewBackendOrders}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Verify in Backend Orders</span>
              </button>

              <button
                id="continue-shopping-btn"
                onClick={onClose}
                className="sm:w-auto py-3 px-5 rounded-xl bg-[#171924] hover:bg-[#202331] text-zinc-300 hover:text-white text-xs font-semibold border border-white/8 transition-all cursor-pointer"
              >
                Continue Shopping
              </button>
            </>
          ) : (
            <button
              id="continue-shopping-btn"
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <span>Back to Store & Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
