import { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminCrudModal } from './components/AdminCrudModal';
import { AdminPanel } from './components/AdminPanel';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Product, CartItem, Order, OrderStatus, StoreStats, AdminUser } from './types';
import { CATEGORIES } from './data/initialProducts';
import { Sparkles, ShieldCheck, Truck, RefreshCw, AlertCircle, Lock } from 'lucide-react';

export default function App() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<StoreStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0
  });

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Admin Authentication State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('rm_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Storefront & Navigation State
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Aisles');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('742 Evergreen Terrace, Springfield');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Start with 1 demo item in cart for instant checkout delight
    return [
      {
        product: {
          id: 'prod-1',
          name: 'Organic Sweet Strawberries',
          category: 'Fresh Fruits',
          price: 4.99,
          originalPrice: 6.49,
          unit: '1 lb clamshell',
          image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
          description: 'Freshly harvested hand-picked California strawberries with natural sweetness.',
          stock: 45,
          badge: '20% OFF'
        },
        quantity: 2
      }
    ];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState('REDDEAL'); // Auto-apply screenshot code

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Admin CRUD Modal state
  const [isAdminCrudOpen, setIsAdminCrudOpen] = useState(false);
  const [adminCrudMode, setAdminCrudMode] = useState<'add' | 'edit'>('add');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const productsSectionRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Fetch products from Backend API
  const fetchProducts = async () => {
    try {
      setFetchError('');
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Could not fetch products from backend');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err: unknown) {
      console.error('Error loading products from server:', err);
      setFetchError(err instanceof Error ? err.message : 'Backend connection error');
    }
  };

  // 2. Fetch orders from Backend API
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Could not fetch orders from backend');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error loading orders from server:', err);
    }
  };

  // 3. Fetch stats from Backend API
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Could not fetch store stats');
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error loading store stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchOrders(), fetchStats()]);
      setLoading(false);
    };
    init();
  }, []);

  // Verify stored admin token
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('rm_admin_token');
      if (!token) return;
      try {
        const res = await fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          localStorage.removeItem('rm_admin_token');
          localStorage.removeItem('rm_admin_user');
          localStorage.removeItem('rm_admin_email');
          setAdminUser(null);
        }
      } catch {
        // Keep cached user if offline or momentary glitch
      }
    };
    verifyToken();
  }, []);

  // Guard admin view: if user tries to switch to admin without authenticating, stay in store and open login
  useEffect(() => {
    if (currentView === 'admin' && !adminUser) {
      setCurrentView('store');
      setIsAdminLoginOpen(true);
    }
  }, [currentView, adminUser]);

  // Admin authentication handlers
  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setCurrentView('admin'); // Navigate admin directly to admin panel upon entering password & email
    showToast(`Welcome back, ${user.name}! Accessing Admin Panel.`);
  };

  const handleAdminLogout = async () => {
    const token = localStorage.getItem('rm_admin_token');
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    localStorage.removeItem('rm_admin_token');
    localStorage.removeItem('rm_admin_user');
    localStorage.removeItem('rm_admin_email');
    setAdminUser(null);
    setCurrentView('store');
    showToast('Admin logged out. Returned to storefront.');
  };

  // Cart operations
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const discount = appliedPromo.toUpperCase() === 'REDDEAL' ? subtotal * 0.20 : 0;
    const fee = subtotal >= 35 || subtotal === 0 ? 0 : 3.99;
    return Math.max(0, subtotal - discount + fee);
  }, [cart, appliedPromo]);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleApplyPromo = (code: string): boolean => {
    if (code.toUpperCase() === 'REDDEAL') {
      setAppliedPromo('REDDEAL');
      showToast('🎉 Promo REDDEAL applied! 20% discount unlocked');
      return true;
    }
    return false;
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    showToast('Promo code removed');
  };

  // When customer completes checkout and order is saved to backend!
  const handleOrderSuccess = (newOrder: Order) => {
    setCompletedOrder(newOrder);
    setCart([]); // Clear cart
    fetchOrders(); // Refresh backend orders
    fetchProducts(); // Refresh inventory stock
    fetchStats(); // Refresh stats
    showToast(`✅ Order ${newOrder.id} successfully saved to backend!`);
  };

  // Backend CRUD Operations
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setAdminCrudMode('add');
    setIsAdminCrudOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setAdminCrudMode('edit');
    setIsAdminCrudOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete product from backend');
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      fetchStats();
      showToast('Product successfully removed from backend inventory');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const handleProductSaved = (product: Product, isNew: boolean) => {
    if (isNew) {
      setProducts((prev) => [product, ...prev]);
      showToast(`Product "${product.name}" added to backend!`);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      );
      showToast(`Product "${product.name}" updated in backend!`);
    }
    fetchStats();
  };

  const handleResetCatalog = async () => {
    if (!confirm('Reset products to default farm-fresh catalog?')) return;
    try {
      const res = await fetch('/api/products/reset', { method: 'POST' });
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        fetchStats();
        showToast('Inventory reset to default RedMarket catalog');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order status');
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      fetchStats();
      showToast(`Order ${orderId} status set to "${newStatus}"`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating order status');
    }
  };

  // Filtered Products for Storefront
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory && selectedCategory !== 'All Aisles') {
      list = list.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, selectedCategory, searchQuery]);

  // Product counts per category
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All Aisles': products.length
    };
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  // Scroll to deals / organic
  const handleShopDeals = () => {
    setSelectedCategory('All Aisles');
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreOrganic = () => {
    setSelectedCategory('Farm Veggies');
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f1f3f7] flex flex-col selection:bg-red-600 selection:text-white">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161823] border border-red-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentView={currentView}
        onToggleView={(view) => {
          if (view === 'admin' && !adminUser) {
            setIsAdminLoginOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        deliveryAddress={deliveryAddress}
        onChangeAddress={setDeliveryAddress}
        pendingOrdersCount={stats.pendingOrders}
        isAdmin={!!adminUser}
        adminUser={adminUser}
        onAdminLogout={handleAdminLogout}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        {currentView === 'store' || !adminUser ? (
          <>
            {/* Hero Section exactly like screenshot */}
            <HeroSection
              onShopDeals={handleShopDeals}
              onExploreOrganic={handleExploreOrganic}
              onApplyPromo={handleApplyPromo}
            />

            {/* Category Aisles Bar from screenshot */}
            <CategoryBar
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              productCounts={productCounts}
            />

            {/* Products Grid Section */}
            <section
              ref={productsSectionRef}
              id="storefront-products-section"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
            >
              {/* Header with Title and Current Aisle info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {selectedCategory}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#181a24] text-red-400 border border-white/8 font-mono">
                      {filteredProducts.length} items
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Morning farm harvest packed cold and delivered to {deliveryAddress.split(',')[0]}
                  </p>
                </div>

                {/* Quick Shortcuts */}
                <div className="flex items-center gap-2">
                  {adminUser && (
                    <button
                      onClick={() => {
                        setCurrentView('admin');
                        handleOpenAddProduct();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#151722] hover:bg-[#1f2231] border border-white/8 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>+ Add Item in Backend</span>
                    </button>
                  )}
                  <button
                    onClick={fetchProducts}
                    title="Refresh from Backend API"
                    className="p-1.5 rounded-xl bg-[#151722] text-zinc-400 hover:text-white border border-white/8 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error Alert if any */}
              {fetchError && (
                <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Backend Connection Notice</p>
                    <p>{fetchError}. Retrying seamlessly.</p>
                  </div>
                </div>
              )}

              {/* Products Loading / Empty / Grid */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-12">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="h-72 rounded-2xl bg-[#13151f] border border-white/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-[#11131b] rounded-2xl border border-white/6 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 text-zinc-500 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">No items found in this aisle</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    No products matched &ldquo;{searchQuery}&rdquo; under {selectedCategory}.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedCategory('All Aisles');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-white hover:bg-zinc-700 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                    {adminUser && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          handleOpenAddProduct();
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-500 cursor-pointer"
                      >
                        + Add New Product to Backend
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredProducts.map((product) => {
                    const inCart = cart.find((i) => i.product.id === product.id);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        quantityInCart={inCart ? inCart.quantity : 0}
                        onAddToCart={handleAddToCart}
                        onUpdateQuantity={handleUpdateQuantity}
                        onQuickView={(p) => setQuickViewProduct(p)}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Bottom Service Guarantees Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-2xl bg-[#12141c] border border-white/6">
                <div className="flex items-center gap-4 p-2">
                  <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">30-Minute Chill-Box Express</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Temperature-controlled insulated boxes keep seafood, greens & dairy arctic fresh.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-2 border-t md:border-t-0 md:border-l border-white/6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">100% Farm Fresh Guarantee</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      If an avocado isn&apos;t perfectly ripe or bread freshly baked, instant credit is issued.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-2 border-t md:border-t-0 md:border-l border-white/6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Chef & Sommelier Curated</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Wild sockeye salmon, pasture eggs, organic heirloom carrots from verified growers.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* ADMIN & BACKEND CRUD VIEW (Authenticated Admins Only) */
          <AdminPanel
            products={products}
            orders={orders}
            stats={stats}
            adminUser={adminUser}
            onLogout={handleAdminLogout}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenEditProduct={handleOpenEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetCatalog={handleResetCatalog}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSwitchToStore={() => setCurrentView('store')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#090a0e] border-t border-white/5 py-8 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">RedMarket</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-red-600 text-white rounded">
              Express
            </span>
            <span className="text-zinc-400">• Farm Fresh & Chef Curated</span>
          </div>

          <div className="flex items-center gap-4">
            {adminUser ? (
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">
                  Admin: <strong className="text-white">{adminUser.email}</strong>
                </span>
                <button
                  onClick={() => setCurrentView(currentView === 'store' ? 'admin' : 'store')}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold underline cursor-pointer"
                >
                  {currentView === 'store' ? 'Admin Panel' : 'Storefront'}
                </button>
                <span>•</span>
                <button
                  onClick={handleAdminLogout}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                title="Admin Authentication Portal"
              >
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Staff Access</span>
              </button>
            )}
            <span>•</span>
            <span>Local Springfield Hub: 742 Evergreen Terrace</span>
          </div>
        </div>
      </footer>

      {/* Cart Slide-over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedPromo={appliedPromo}
        onApplyPromo={handleApplyPromo}
        onRemovePromo={handleRemovePromo}
      />

      {/* Checkout Modal: Saves order to backend upon completion! */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        defaultAddress={deliveryAddress}
        appliedPromo={appliedPromo}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        isAdmin={!!adminUser}
        onViewBackendOrders={() => {
          setCompletedOrder(null);
          setCurrentView('admin');
        }}
      />

      {/* Admin Product CRUD Modal (Add / Edit) */}
      <AdminCrudModal
        isOpen={isAdminCrudOpen}
        onClose={() => setIsAdminCrudOpen(false)}
        mode={adminCrudMode}
        initialProduct={editingProduct}
        onSaveSuccess={handleProductSaved}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        quantityInCart={
          quickViewProduct
            ? cart.find((i) => i.product.id === quickViewProduct.id)?.quantity || 0
            : 0
        }
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Admin Authentication Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
