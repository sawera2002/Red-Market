import React from 'react';
import { Plus, Minus, Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  onQuickView
}) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-[#13151d] border border-white/8 hover:border-red-500/40 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:shadow-red-950/20"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-4/3 overflow-hidden bg-[#0d0f15]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#13151d] via-transparent to-transparent opacity-80" />

        {/* Badge: e.g. 20% OFF, Chef Pick, etc. */}
        {product.badge && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#e50914] text-white text-[11px] font-black uppercase tracking-wider shadow-md">
            {product.badge}
          </div>
        )}

        {/* Stock / Origin tag */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {product.origin && (
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-zinc-300 font-medium">
              {product.origin}
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-md bg-red-900/80 text-red-200 text-[10px] font-bold">
              Sold Out
            </span>
          ) : product.stock < 10 ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <span className="font-semibold text-red-400/90 tracking-wide text-[11px] uppercase">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-bold text-zinc-200 text-xs">
                {product.rating ? product.rating.toFixed(1) : '4.9'}
              </span>
              <span className="text-[10px] text-zinc-400">
                ({product.reviewsCount || 42})
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onQuickView && onQuickView(product)}
            className="text-sm font-bold text-white leading-snug line-clamp-2 hover:text-red-400 transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Unit / Weight */}
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            {product.unit}
          </p>

          {/* Short Description */}
          {product.description && (
            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-white/6 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-zinc-400 line-through font-medium">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Add / Qty Control Button */}
          {quantityInCart > 0 ? (
            <div className="flex items-center gap-2 bg-[#1b1e2a] border border-red-500/40 rounded-xl p-1">
              <button
                id={`decrease-qty-${product.id}`}
                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Decrease"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-white px-1">
                {quantityInCart}
              </span>
              <button
                id={`increase-qty-${product.id}`}
                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                disabled={quantityInCart >= product.stock}
                className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Increase"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              id={`add-to-cart-${product.id}`}
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 active:scale-95'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
