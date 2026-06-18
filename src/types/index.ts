/**
 * Shared TypeScript types used across the app.
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;   // Original price before discount
  category: string;        // Maps to Category.id
  categoryName: string;
  images: string[];        // URLs or local identifiers
  rating: number;          // 0–5
  reviewCount: number;
  inStock: boolean;
  specifications: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  icon: string;            // MaterialIcons icon name
  color: string;           // Accent colour for the category tile
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface Order {
  id: string;
  userId?: string;         // Undefined for guest orders
  guestEmail?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  createdAt: Date;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
