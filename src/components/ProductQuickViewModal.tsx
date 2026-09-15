import React from 'react';
import { X, Star, ShieldCheck, MapPin, Truck, Plus, Minus } from 'lucide-react';
import { Product } from '../types';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-zinc-400 hover:text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative h-64 w-full bg-zinc-900">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-transparent to-transparent" />
          {product.badge && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg">
              {product.badge}
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-1.5 text-amber-400 text-xs">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-white">{product.rating || 4.9}</span>
              <span className="text-zinc-400">({product.reviewsCount || 48} verified reviews)</span>
            </div>
          </div>

          <h3 className="text-xl font-black text-white">{product.name}</h3>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-zinc-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-zinc-400 ml-1">/ {product.unit}</span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/6 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>Origin: {product.origin || 'California Organic Farm'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Stock: {product.stock} available</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-400" />
              <span>30-min express chill box</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">100% Guaranteed</span>
              <span>Farm to table fresh</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-4">
            {quantityInCart > 0 ? (
              <div className="flex items-center gap-3 bg-[#181a24] p-2 rounded-xl border border-red-500/40">
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-red-600 text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-white px-2">{quantityInCart} in Cart</span>
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                  disabled={quantityInCart >= product.stock}
                  className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center font-bold disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                disabled={product.stock <= 0}
                className="flex-1 py-3 px-6 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Cart (${product.price.toFixed(2)})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-[#181a24] hover:bg-[#222533] text-zinc-300 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
