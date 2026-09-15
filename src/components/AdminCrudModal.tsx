import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/initialProducts';

interface AdminCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initialProduct?: Product | null;
  onSaveSuccess: (product: Product, isNew: boolean) => void;
}

const IMAGE_PRESETS = [
  { name: 'Strawberries', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80' },
  { name: 'Eggs', url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Salmon', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sourdough', url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80' },
  { name: 'Avocado', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80' },
  { name: 'Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
  { name: 'Steak', url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cold Brew', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80' }
];

export const AdminCrudModal: React.FC<AdminCrudModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialProduct,
  onSaveSuccess
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Fresh Fruits');
  const [price, setPrice] = useState('4.99');
  const [originalPrice, setOriginalPrice] = useState('');
  const [unit, setUnit] = useState('1 lb pack');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('30');
  const [badge, setBadge] = useState('');
  const [origin, setOrigin] = useState('Local California Farm');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validCategories = CATEGORIES.filter(c => c !== 'All Aisles');

  useEffect(() => {
    if (mode === 'edit' && initialProduct) {
      setName(initialProduct.name);
      setCategory(initialProduct.category);
      setPrice(String(initialProduct.price));
      setOriginalPrice(initialProduct.originalPrice ? String(initialProduct.originalPrice) : '');
      setUnit(initialProduct.unit);
      setImage(initialProduct.image);
      setDescription(initialProduct.description || '');
      setStock(String(initialProduct.stock));
      setBadge(initialProduct.badge || '');
      setOrigin(initialProduct.origin || '');
    } else {
      setName('');
      setCategory('Fresh Fruits');
      setPrice('4.99');
      setOriginalPrice('');
      setUnit('1 lb pack');
      setImage(IMAGE_PRESETS[0].url);
      setDescription('');
      setStock('35');
      setBadge('');
      setOrigin('Local California Farm');
    }
    setError('');
  }, [mode, initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please provide a valid positive price');
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      category: category.trim(),
      price: numPrice,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      unit: unit.trim() || '1 item',
      image: image.trim() || IMAGE_PRESETS[0].url,
      description: description.trim(),
      stock: parseInt(stock, 10) || 0,
      badge: badge.trim() || undefined,
      origin: origin.trim() || undefined
    };

    try {
      const url = mode === 'add' ? '/api/products' : `/api/products/${initialProduct?.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      onSaveSuccess(data.product, mode === 'add');
      onClose();
    } catch (err: unknown) {
      console.error('Error saving product:', err);
      setError(err instanceof Error ? err.message : 'Server error while saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-crud-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-[#11131c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-white/8 flex items-center justify-between bg-[#151724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center">
              {mode === 'add' ? <Plus className="w-5 h-5 stroke-[2.2]" /> : <Edit2 className="w-5 h-5 stroke-[2.2]" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {mode === 'add' ? 'Add New Product to Backend' : 'Edit Product (Backend CRUD)'}
              </h2>
              <p className="text-xs text-zinc-400">
                {mode === 'add'
                  ? 'Item will be saved to backend database and displayed in store'
                  : `Editing ID: ${initialProduct?.id}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a1c29] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Honeycrisp Apples"
              className="w-full px-3.5 py-2 text-xs bg-[#171926] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Aisle / Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#171926] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {validCategories.map((c) => (
                  <option key={c} value={c} className="bg-[#171926]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Unit / Package Size *
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. 1 lb pack, 12 count, 500ml"
                className="w-full px-3.5 py-2 text-xs bg-[#171926] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Prices & Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Selling Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4.99"
                className="w-full px-3.5 py-2 text-xs bg-[#171926] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Original Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="6.99 (optional)"
                className="w-full px-3.5 py-2 text-xs bg-[#171926] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="40"
                className="w-full px-3.5 py-2 text-xs bg-[#171926] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Badge & Origin */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Promotional Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. 20% OFF, Chef Pick, Organic"
                className="w-full px-3.5 py-2 text-xs bg-[#171926] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Farm Origin / Producer
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Watsonville Valley, CA"
                className="w-full px-3.5 py-2 text-xs bg-[#171926] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Image URL & Preset Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Image URL</span>
              </label>
              <span className="text-[10px] text-zinc-400">Pick preset or paste custom</span>
            </div>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 text-xs bg-[#171926] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 mb-2"
            />

            {/* Quick Image Presets */}
            <div className="flex flex-wrap gap-1.5">
              {IMAGE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setImage(preset.url)}
                  className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                    image === preset.url
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-[#1e2130] text-zinc-400 hover:text-white'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Crisp, fresh description for customer view..."
              className="w-full px-3.5 py-2 text-xs bg-[#171926] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-white/8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              id="admin-submit-product-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Backend...</span>
                </>
              ) : (
                <span>
                  {mode === 'add' ? 'Add Product to Backend' : 'Update in Backend'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
