import React, { useState } from 'react';
import { ShoppingBag, Search, Heart, MapPin, ChevronDown, Database, Store, LogOut, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../types';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentView: 'store' | 'admin';
  onToggleView: (view: 'store' | 'admin') => void;
  deliveryAddress: string;
  onChangeAddress: (addr: string) => void;
  pendingOrdersCount: number;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  searchQuery,
  onSearchChange,
  currentView,
  onToggleView,
  deliveryAddress,
  onChangeAddress,
  pendingOrdersCount,
  isAdmin,
  adminUser,
  onAdminLogout
}) => {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(deliveryAddress);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAddress.trim()) {
      onChangeAddress(tempAddress.trim());
      setIsEditingAddress(false);
    }
  };

  return (
    <header id="site-header" className="sticky top-0 z-40 w-full bg-[#0b0c10]/95 backdrop-blur-md border-b border-white/5">
      {/* Top Notification Announcement Bar - Exactly like screenshot */}
      <div id="top-announcement-bar" className="w-full bg-[#e50914] text-white py-1.5 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block animate-pulse">🔥</span>
        <span>
          <strong className="font-bold uppercase tracking-wider">RED SALE:</strong> 20% OFF all organic greens & wild seafood with code{' '}
          <span className="bg-black/30 px-1.5 py-0.5 rounded text-white font-mono font-bold tracking-wider">REDDEAL</span>{' '}
          • Free 30-min express delivery over $35
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => onToggleView('store')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl border border-red-500/40 bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-red-500 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-red-400 transition-colors">
                  RedMarket
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600/90 text-white rounded">
                  Express
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium tracking-tight">
                Farm Fresh & Chef Curated
              </p>
            </div>
          </button>

          {/* Delivery Location Pill from screenshot */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <button
                id="delivery-pill-btn"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#151720] border border-white/8 hover:border-white/20 transition-all text-xs text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                    <span>Deliver to:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      25 min
                    </span>
                  </div>
                  <div className="text-white font-medium truncate max-w-[180px] flex items-center gap-1">
                    <span>{deliveryAddress}</span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </div>
                </div>
              </button>

              {/* Address Edit Popover */}
              {isEditingAddress && (
                <div className="absolute left-0 mt-2 w-72 p-3 bg-[#171923] rounded-xl border border-white/15 shadow-2xl z-50">
                  <p className="text-xs font-semibold text-white mb-2">Change Delivery Address</p>
                  <form onSubmit={handleSaveAddress}>
                    <input
                      type="text"
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      placeholder="Enter street & city"
                      className="w-full px-3 py-1.5 text-xs bg-[#0f1015] border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 mb-2"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Search Bar from screenshot */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="header-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search fresh fruits, salmon, organic milk, sourdough..."
              className="w-full pl-10 pr-4 py-2 bg-[#14161f] border border-white/8 hover:border-white/15 focus:border-red-500 rounded-xl text-xs text-white placeholder-zinc-400 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Admin Mode Controls: ONLY visible if admin is authenticated */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#151720] p-1 rounded-xl border border-white/8">
                <button
                  id="view-store-btn"
                  onClick={() => onToggleView('store')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    currentView === 'store'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Store</span>
                </button>
                <button
                  id="view-admin-btn"
                  onClick={() => onToggleView('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all relative cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-current" />
                  <span>Admin Panel</span>
                  {pendingOrdersCount > 0 && (
                    <span className="ml-1 w-4 h-4 bg-emerald-500 text-black text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Admin identity badge & Logout button */}
              <div className="hidden xl:flex items-center gap-2 pl-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  <span className="truncate max-w-[110px]">{adminUser?.name || 'Admin'}</span>
                </div>
                <button
                  onClick={onAdminLogout}
                  title="Logout Admin"
                  className="p-1.5 rounded-lg bg-[#1a1c27] hover:bg-red-600/30 text-zinc-400 hover:text-red-300 border border-white/8 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Favorites Button from screenshot */}
          <button
            id="wishlist-btn"
            title="Wishlist"
            className="w-10 h-10 rounded-xl bg-[#151720] border border-white/8 hover:border-white/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Cart Button from screenshot */}
          <button
            id="cart-button"
            onClick={onOpenCart}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-red-600/25 active:scale-95 transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
            <span className="font-bold border-l border-red-400/40 pl-2">
              ${cartTotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search fresh fruits, salmon, milk..."
            className="w-full pl-10 pr-4 py-2 bg-[#14161f] border border-white/8 rounded-xl text-xs text-white placeholder-zinc-400 focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};
