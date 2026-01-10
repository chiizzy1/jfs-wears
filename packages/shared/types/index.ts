// JFS Wears - Shared Types
// Types shared between frontend and backend

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  isActive: boolean;
}

export type StaffRole = "ADMIN" | "MANAGER" | "STAFF";

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
  isDefault: boolean;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  children?: Category[];
  position: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  categoryId: string;
  category?: Category;
  isActive: boolean;
  isFeatured: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  priceAdjustment: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  position: number;
  isMain: boolean;
}

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId: string;
  variant: ProductVariant;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ============================================
// ORDER TYPES
// ============================================

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  guestEmail?: string;
  guestPhone?: string;
  shippingAddress: ShippingAddress;
  shippingZone: ShippingZone;
  shippingFee: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentProvider?: PaymentProvider;
  paymentReference?: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productName: string;
  variantSize?: string;
  variantColor?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "OPAY_WALLET" | "CASH_ON_DELIVERY";

export type PaymentProvider = "OPAY" | "MONNIFY" | "PAYSTACK";

// ============================================
// SHIPPING TYPES
// ============================================

export interface ShippingZone {
  id: string;
  name: string;
  states: string[];
  fee: number;
  isActive: boolean;
}

// ============================================
// PROMOTION TYPES
// ============================================

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User | Staff;
  tokens: AuthTokens;
}
