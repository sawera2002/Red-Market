export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  description: string;
  stock: number;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  origin?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  aptSuite?: string;
  city: string;
  postalCode?: string;
  instructions?: string;
  deliverySpeed: 'express_30' | 'standard_60';
  paymentMethod: 'cod' | 'card' | 'redpay';
}

export type OrderStatus = 'Received' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
}

export interface AdminUser {
  email: string;
  role: string;
  name: string;
  token: string;
}
