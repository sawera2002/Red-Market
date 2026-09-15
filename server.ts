import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS } from './src/data/initialProducts';
import { Product, Order, OrderStatus } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Data Storage Directory
const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache synced with disk
let products: Product[] = [];
let orders: Order[] = [];

// Initialize data from disk or seed
function loadData() {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      products = JSON.parse(data);
    } else {
      products = [...INITIAL_PRODUCTS];
      saveProducts();
    }
  } catch (err) {
    console.error('Error loading products.json, falling back to seed:', err);
    products = [...INITIAL_PRODUCTS];
  }

  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      orders = JSON.parse(data);
    } else {
      // Create initial demo order so backend order listing has immediate context
      orders = [
        {
          id: 'RM-78291',
          customer: {
            fullName: 'Sarah Jenkins',
            email: 'sarah.j@example.com',
            phone: '(555) 349-8201',
            address: '742 Evergreen Terrace',
            aptSuite: 'Apt 4B',
            city: 'Springfield',
            postalCode: '97477',
            instructions: 'Leave at front porch chill box please.',
            deliverySpeed: 'express_30',
            paymentMethod: 'card'
          },
          items: [
            {
              id: 'prod-1',
              name: 'Organic Sweet Strawberries',
              category: 'Fresh Fruits',
              price: 4.99,
              unit: '1 lb clamshell',
              image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
              quantity: 2
            },
            {
              id: 'prod-4',
              name: 'Artisan San Francisco Sourdough Boule',
              category: 'Artisan Bakery',
              price: 6.25,
              unit: '24 oz loaf',
              image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
              quantity: 1
            }
          ],
          subtotal: 16.23,
          discount: 3.25,
          promoCode: 'REDDEAL',
          deliveryFee: 0,
          total: 12.98,
          status: 'Out for Delivery',
          createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
          estimatedDelivery: '12 mins'
        }
      ];
      saveOrders();
    }
  } catch (err) {
    console.error('Error loading orders.json:', err);
    orders = [];
  }
}

function saveProducts() {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist products to disk:', err);
  }
}

function saveOrders() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist orders to disk:', err);
  }
}

loadData();

// ==========================================
// BACKEND API ROUTES: PRODUCTS (CRUD)
// ==========================================

// 1. READ: List all products (with optional filter & search)
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filtered = [...products];

  if (category && category !== 'All Aisles') {
    filtered = filtered.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: filtered.length,
    products: filtered
  });
});

// 2. READ: Single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, product });
});

// 3. CREATE: Add new product
app.post('/api/products', (req, res) => {
  const { name, category, price, originalPrice, unit, image, description, stock, badge, origin } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({ success: false, error: 'Name, Category and Price are required.' });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name: String(name).trim(),
    category: String(category).trim(),
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    unit: unit ? String(unit).trim() : '1 item',
    image: image && String(image).trim().length > 5
      ? String(image).trim()
      : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    description: description ? String(description).trim() : 'Farm fresh curated product.',
    stock: stock !== undefined ? Number(stock) : 25,
    badge: badge ? String(badge).trim() : undefined,
    origin: origin ? String(origin).trim() : 'Local Harvest Farm',
    rating: 5.0,
    reviewsCount: 1
  };

  products.unshift(newProduct);
  saveProducts();

  res.status(201).json({
    success: true,
    message: 'Product added successfully to backend inventory',
    product: newProduct
  });
});

// 4. UPDATE: Edit existing product
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const current = products[index];
  const { name, category, price, originalPrice, unit, image, description, stock, badge, origin, rating, reviewsCount } = req.body;

  const updatedProduct: Product = {
    ...current,
    name: name !== undefined ? String(name).trim() : current.name,
    category: category !== undefined ? String(category).trim() : current.category,
    price: price !== undefined ? Number(price) : current.price,
    originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : undefined) : current.originalPrice,
    unit: unit !== undefined ? String(unit).trim() : current.unit,
    image: image !== undefined ? String(image).trim() : current.image,
    description: description !== undefined ? String(description).trim() : current.description,
    stock: stock !== undefined ? Number(stock) : current.stock,
    badge: badge !== undefined ? (badge ? String(badge).trim() : undefined) : current.badge,
    origin: origin !== undefined ? (origin ? String(origin).trim() : undefined) : current.origin,
    rating: rating !== undefined ? Number(rating) : current.rating,
    reviewsCount: reviewsCount !== undefined ? Number(reviewsCount) : current.reviewsCount
  };

  products[index] = updatedProduct;
  saveProducts();

  res.json({
    success: true,
    message: 'Product updated successfully in backend',
    product: updatedProduct
  });
});

// 5. DELETE: Remove product from backend
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const removed = products.splice(index, 1)[0];
  saveProducts();

  res.json({
    success: true,
    message: `Product "${removed.name}" deleted from backend`,
    deletedId: req.params.id
  });
});

// 6. RESET: Reset products to initial curated catalog
app.post('/api/products/reset', (req, res) => {
  products = [...INITIAL_PRODUCTS];
  saveProducts();
  res.json({
    success: true,
    message: 'Inventory reset to default RedMarket catalog',
    products
  });
});

// ==========================================
// BACKEND API ROUTES: ORDERS (CUSTOMER CHECKOUT)
// ==========================================

// 1. CREATE: Customer Checkout saves order to backend!
app.post('/api/orders', (req, res) => {
  const { customer, items, subtotal, discount, promoCode, deliveryFee, total } = req.body;

  if (!customer || !customer.fullName || !customer.phone || !customer.address) {
    return res.status(400).json({
      success: false,
      error: 'Customer name, phone, and delivery address are required.'
    });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Cart cannot be empty for checkout.'
    });
  }

  // Deduct inventory stock for ordered items
  for (const item of items) {
    const prod = products.find(p => p.id === item.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - (item.quantity || 1));
    }
  }
  saveProducts();

  // Generate random order ID (e.g. RM-94821)
  const orderNum = Math.floor(10000 + Math.random() * 90000);
  const newOrder: Order = {
    id: `RM-${orderNum}`,
    customer: {
      fullName: customer.fullName.trim(),
      email: customer.email ? customer.email.trim() : '',
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      aptSuite: customer.aptSuite ? customer.aptSuite.trim() : '',
      city: customer.city ? customer.city.trim() : 'Springfield',
      postalCode: customer.postalCode ? customer.postalCode.trim() : '',
      instructions: customer.instructions ? customer.instructions.trim() : '',
      deliverySpeed: customer.deliverySpeed || 'express_30',
      paymentMethod: customer.paymentMethod || 'cod'
    },
    items: items.map(i => ({
      id: i.id,
      name: i.name,
      category: i.category || 'Grocery',
      price: Number(i.price),
      unit: i.unit || '1 item',
      image: i.image || '',
      quantity: Number(i.quantity) || 1
    })),
    subtotal: Number(subtotal) || 0,
    discount: Number(discount) || 0,
    promoCode: promoCode || undefined,
    deliveryFee: Number(deliveryFee) || 0,
    total: Number(total) || 0,
    status: 'Received',
    createdAt: new Date().toISOString(),
    estimatedDelivery: customer.deliverySpeed === 'express_30' ? '25-30 mins' : '45-60 mins'
  };

  orders.unshift(newOrder);
  saveOrders();

  console.log(`[ORDER SAVED] New Order ID: ${newOrder.id} for ${newOrder.customer.fullName} - Total: $${newOrder.total}`);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully and persisted to backend!',
    order: newOrder
  });
});

// 2. READ: Get all customer orders
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    count: orders.length,
    orders
  });
});

// 3. READ: Get single order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order });
});

// 4. UPDATE: Update order status (Admin workflow)
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body as { status: OrderStatus };
  const validStatuses: OrderStatus[] = ['Received', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid order status' });
  }

  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  order.status = status;
  saveOrders();

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    order
  });
});

// ==========================================
// BACKEND API ROUTES: STORE STATS & HEALTH
// ==========================================
app.get('/api/stats', (req, res) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Received' || o.status === 'Preparing' || o.status === 'Out for Delivery').length;

  res.json({
    success: true,
    stats: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders: orders.length,
      totalProducts: products.length,
      pendingOrders
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==========================================
// BACKEND API ROUTES: ADMIN AUTHENTICATION
// ==========================================
const ADMIN_CREDENTIALS = [
  { email: 'admin@redmarket.com', password: 'admin123', name: 'Master Administrator', role: 'Super Admin' },
  { email: 'sawerachohan9@gmail.com', password: 'admin123', name: 'Sawera Chohan', role: 'Store Owner' }
];

const activeAdminSessions = new Map<string, { email: string; role: string; name: string; loginTime: string }>();

// 1. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPassword = String(password).trim();

  const adminMatch = ADMIN_CREDENTIALS.find(
    a => a.email.toLowerCase() === cleanEmail && a.password === cleanPassword
  );

  if (!adminMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid admin credentials. Please check your email and password.'
    });
  }

  // Generate session token
  const token = `adm_session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  activeAdminSessions.set(token, {
    email: adminMatch.email,
    role: adminMatch.role,
    name: adminMatch.name,
    loginTime: new Date().toISOString()
  });

  console.log(`[ADMIN AUTH] Admin logged in: ${adminMatch.email}`);

  return res.json({
    success: true,
    message: 'Admin authenticated successfully',
    token,
    admin: {
      email: adminMatch.email,
      name: adminMatch.name,
      role: adminMatch.role
    }
  });
});

// 2. Admin Verify
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token || !activeAdminSessions.has(token)) {
    return res.status(401).json({ success: false, error: 'Unauthorized or session expired' });
  }

  const session = activeAdminSessions.get(token);
  return res.json({
    success: true,
    admin: session
  });
});

// 3. Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    activeAdminSessions.delete(token);
  }

  return res.json({ success: true, message: 'Admin logged out successfully' });
});

// ==========================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RedMarket Express Server running on http://localhost:${PORT}`);
  });
}

startServer();
