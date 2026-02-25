export interface User {
  username: string;
  uid: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: 'buyer' | 'seller' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon_url: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: number;
  title: string;
  description: string;
  price: number;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  sales_count: number;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface Seller {
  id: string;
  username: string;
  display_name: string;
  description: string;
  avatar_url: string;
  rating: number;
  total_sales: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Cart {
  id: number;
  username: string;
  items: CartItem[];
  subtotal: number;
}

export interface OrderItem {
  id: number;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  uid: string;
  username: string;
  status: 'pending' | 'paid' | 'delivered' | 'cancelled';
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  product_id: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  product_id: string;
  created_at: string;
}

export interface BalanceTransaction {
  id: number;
  type: 'deposit' | 'withdraw';
  amount: number;
  comment: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export type UserRole = 'buyer' | 'seller' | 'admin';
