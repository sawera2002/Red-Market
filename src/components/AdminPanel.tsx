import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  DollarSign,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  ArrowLeft,
  ChevronDown,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { Product, Order, OrderStatus, StoreStats, AdminUser } from '../types';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  stats: StoreStats;
  adminUser: AdminUser | null;
  onLogout: () => void;
  onOpenAddProduct: () => void;
  onOpenEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetCatalog: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onSwitchToStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  orders,
  stats,
  adminUser,
  onLogout,
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onResetCatalog,
  onUpdateOrderStatus,
  onSwitchToStore
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderFilter, setOrderFilter] = useState<string>('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'All') return true;
    return o.status.toLowerCase() === orderFilter.toLowerCase();
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Received':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Preparing':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Out for Delivery':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Delivered':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Cancelled':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <section id="admin-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141c] p-6 rounded-2xl border border-white/8">
        <div>
          <button
            onClick={onSwitchToStore}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Backend Management & CRUD
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 text-xs font-mono font-bold border border-red-500/30">
              Live Express API
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Full Product CRUD (Add, Edit, Delete) & Persistent Customer Checkout Orders.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {adminUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171924] border border-white/10 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-white font-bold block leading-none">{adminUser.name}</span>
                <span className="text-[10px] text-zinc-400 leading-none">{adminUser.email}</span>
              </div>
            </div>
          )}

          <button
            id="reset-catalog-btn"
            onClick={onResetCatalog}
            title="Reset catalog to initial seed items"
            className="px-3.5 py-2 rounded-xl bg-[#1a1c27] hover:bg-[#232635] text-zinc-300 hover:text-white text-xs font-semibold border border-white/8 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Products</span>
          </button>

          <button
            id="admin-add-product-main-btn"
            onClick={onOpenAddProduct}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          <button
            id="admin-logout-btn"
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#14161f] border border-white/8">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Orders Placed</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats.totalOrders}
          </div>
          <span className="text-[11px] text-zinc-400">Recorded in backend</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14161f] border border-white/8">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-400">From customer checkouts</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14161f] border border-white/8">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Active Inventory</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats.totalProducts}
          </div>
          <span className="text-[11px] text-zinc-400">CRUD products in catalog</span>
        </div>

        <div className="p-4 rounded-xl bg-[#14161f] border border-white/8">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Pending Delivery</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats.pendingOrders}
          </div>
          <span className="text-[11px] text-zinc-400">Needs packing / delivery</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-white/8 pb-2">
        <button
          id="admin-tab-products"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
              : 'text-zinc-400 hover:text-white bg-[#14161f]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Inventory (CRUD: Add, Edit, Delete)</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
            {products.length}
          </span>
        </button>

        <button
          id="admin-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
              : 'text-zinc-400 hover:text-white bg-[#14161f]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Checkout Orders</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-mono">
            {orders.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PRODUCT CRUD MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#13151f] p-4 rounded-xl border border-white/6">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title or category..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#191c28] border border-white/10 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-zinc-400 whitespace-nowrap">Filter Aisle:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#191c28] border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-[#12141c] rounded-2xl border border-white/8 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#171924] text-zinc-400 uppercase text-[10px] font-bold tracking-wider border-b border-white/6">
                  <tr>
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Badge / Origin</th>
                    <th className="py-3.5 px-4 text-right">Actions (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        id={`admin-row-${product.id}`}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Item Thumbnail & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-zinc-800 flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{product.name}</p>
                              <p className="text-[11px] text-zinc-400">{product.unit}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-[#1d202d] text-zinc-300 text-[11px] font-semibold border border-white/6">
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          ${product.price.toFixed(2)}
                          {product.originalPrice && (
                            <span className="ml-1 text-[11px] text-zinc-400 line-through font-normal">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              product.stock <= 5
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {product.stock} in stock
                          </span>
                        </td>

                        {/* Badge / Origin */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            {product.badge && (
                              <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 text-[10px] font-bold">
                                {product.badge}
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-400">{product.origin}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Button */}
                            <button
                              id={`edit-product-${product.id}`}
                              onClick={() => onOpenEditProduct(product)}
                              className="p-1.5 rounded-lg bg-[#1a1c27] hover:bg-blue-600 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit product details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button with Confirmation */}
                            {confirmDeleteId === product.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    onDeleteProduct(product.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-500"
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 rounded bg-zinc-800 text-zinc-400 text-[10px] hover:text-white"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                id={`delete-product-${product.id}`}
                                onClick={() => setConfirmDeleteId(product.id)}
                                className="p-1.5 rounded-lg bg-[#1a1c27] hover:bg-red-600 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Delete from backend"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAVED CUSTOMER CHECKOUT ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['All', 'Received', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    orderFilter === filter
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-[#14161f] text-zinc-400 hover:text-white border border-white/6'
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-[#12141c] rounded-2xl border border-white/8 p-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-zinc-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Orders Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No orders match this status. You can go to the storefront, add items to the cart, and complete checkout to see them persist here!
              </p>
              <button
                onClick={onSwitchToStore}
                className="mt-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20"
              >
                Go to Storefront & Checkout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  id={`order-card-${order.id}`}
                  className="bg-[#12141c] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white font-mono bg-red-600/15 border border-red-500/30 text-red-400 px-3 py-1 rounded-lg">
                        {order.id}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {order.customer.fullName}
                        </h4>
                        <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}{' '}
                            • {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Live Status Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 font-medium">Status:</span>
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none appearance-none pr-8 cursor-pointer ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <option value="Received">Received</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                      </div>
                    </div>
                  </div>

                  {/* Order Body: Customer details & Items */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
                    {/* Customer Destination Info */}
                    <div className="md:col-span-4 space-y-1.5 text-xs text-zinc-400 border-r border-white/6 pr-4">
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Delivery Information
                      </div>
                      <p className="text-white font-medium">
                        {order.customer.address}
                        {order.customer.aptSuite ? `, ${order.customer.aptSuite}` : ''}
                      </p>
                      <p>{order.customer.city} {order.customer.postalCode}</p>
                      <p className="text-red-400 font-medium">{order.customer.phone}</p>
                      {order.customer.email && <p className="text-zinc-400">{order.customer.email}</p>}

                      {order.customer.instructions && (
                        <p className="p-2 rounded bg-[#171924] text-zinc-300 text-[11px] mt-2 italic border border-white/5">
                          &ldquo;{order.customer.instructions}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 uppercase font-semibold">
                          Payment: {order.customer.paymentMethod}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold">
                          {order.customer.deliverySpeed === 'express_30' ? '30m Express' : 'Standard'}
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="md:col-span-8 space-y-2">
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Items ({order.items.reduce((s, i) => s + i.quantity, 0)} items)
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-[#171924] border border-white/4"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover bg-zinc-800 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-zinc-400 font-mono">
                                {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-white font-mono">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total Price Bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/6 text-xs">
                        <div className="flex items-center gap-3 text-zinc-400">
                          <span>Subtotal: ${order.subtotal.toFixed(2)}</span>
                          {order.discount > 0 && (
                            <span className="text-red-400">
                              Discount: -${order.discount.toFixed(2)} ({order.promoCode})
                            </span>
                          )}
                          <span>Delivery: ${order.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-zinc-400 mr-2">Paid Total:</span>
                          <span className="text-base font-black text-white font-mono">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
