const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Admin API functions with authentication (uses httpOnly cookies)
class AdminAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Send httpOnly cookies
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Request failed" }));
      console.error(`[AdminAPI] Error: ${res.status}`, error);
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Generic HTTP methods for flexible endpoint access
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{
      user: { id: string; email: string; name: string; role: string };
      tokens: { accessToken: string; refreshToken: string };
    }>("/auth/staff/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Analytics
  async getDashboard() {
    return this.request<{
      overview: { totalProducts: number; totalOrders: number; totalUsers: number; ordersToday: number };
      revenue: { today: number; thisMonth: number; thisYear: number };
      ordersByStatus: { status: string; count: number }[];
      topProducts: { id: string; name: string; totalSold: number }[];
    }>("/analytics/dashboard");
  }

  async getLowStock(threshold = 10) {
    return this.request<{ productId: string; productName: string; variantId: string; sku: string; stock: number }[]>(
      `/analytics/low-stock?threshold=${threshold}`
    );
  }

  async getRevenueByPeriod(period: "day" | "week" | "month" = "month") {
    return this.request<{ date: string; revenue: number }[]>(`/analytics/revenue?period=${period}`);
  }

  async getOrdersByPeriod(period: "day" | "week" | "month" = "week") {
    // Fetch recent orders and group by day for weekly chart
    const orders = await this.getOrders({ limit: 100 });
    const grouped = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      if (!acc[dayName]) acc[dayName] = 0;
      acc[dayName]++;
      return acc;
    }, {} as Record<string, number>);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({ day, orders: grouped[day] || 0 }));
  }

  // Products
  async getProducts(params?: { category?: string; limit?: number; offset?: number }) {
    const search = new URLSearchParams();
    if (params?.category) search.set("category", params.category);
    if (params?.limit) search.set("limit", params.limit.toString());
    if (params?.offset) search.set("offset", params.offset.toString());

    // API returns paginated response { items, total, page, ... }
    const response = await this.request<{ items: Product[]; total: number; page: number } | Product[]>(
      `/products?${search.toString()}`
    );

    // Handle both paginated and array responses for compatibility
    return Array.isArray(response) ? response : response.items || [];
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(data: CreateProductDto) {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<CreateProductDto>) {
    return this.request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, { method: "DELETE" });
  }

  // Product Image Upload (multipart/form-data)
  async uploadProductImages(productId: string, files: File[]): Promise<UploadResult> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch(`${API_BASE_URL}/products/${productId}/upload-images`, {
      method: "POST",
      body: formData,
      credentials: "include", // Send httpOnly cookies
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Orders
  async getOrders(params?: { status?: string; limit?: number; offset?: number }) {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.limit) search.set("limit", params.limit.toString());
    if (params?.offset) search.set("offset", params.offset.toString());

    // API returns paginated response { items, total, page, ... }
    const response = await this.request<{ items: Order[]; total: number; page: number } | Order[]>(
      `/orders?${search.toString()}`
    );

    // Handle both paginated and array responses for compatibility
    return Array.isArray(response) ? response : response.items || [];
  }

  async getOrder(id: string) {
    return this.request<Order>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<Order>(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Promotions
  async getPromotions(includeInactive = false) {
    return this.request<Promotion[]>(`/promotions?includeInactive=${includeInactive}`);
  }

  async getPromotion(id: string) {
    return this.request<Promotion>(`/promotions/${id}`);
  }

  async createPromotion(data: CreatePromotionDto) {
    return this.request<Promotion>("/promotions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePromotion(id: string, data: UpdatePromotionDto) {
    return this.request<Promotion>(`/promotions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePromotion(id: string) {
    return this.request<void>(`/promotions/${id}`, { method: "DELETE" });
  }

  // Users (Customers)
  async getUsers(params?: { page?: number; limit?: number }) {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", params.page.toString());
    if (params?.limit) search.set("limit", params.limit.toString());
    return this.request<{ items: User[]; total: number; page: number; limit: number }>(`/users?${search.toString()}`);
  }

  async deleteUser(id: string) {
    return this.request<void>(`/users/${id}`, { method: "DELETE" });
  }

  // Staff
  async getStaff() {
    return this.request<Staff[]>("/staff");
  }

  async createStaff(data: CreateStaffDto) {
    return this.request<Staff>("/staff", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteStaff(id: string) {
    return this.request<void>(`/staff/${id}`, { method: "DELETE" });
  }

  // Categories
  async getCategories() {
    return this.request<Category[]>("/categories");
  }

  // Settings
  async getSettings() {
    return this.request<StoreSettings>("/settings");
  }

  async updateSettings(data: UpdateSettingsDto) {
    return this.request<StoreSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  price?: number; // Legacy support
  compareAtPrice?: number;
  categoryId: string;
  category?: Category;
  gender?: "MEN" | "WOMEN" | "UNISEX";
  images: { id: string; url: string; alt?: string; isMain: boolean; position: number }[];
  variants: {
    id: string;
    sku: string;
    size?: string;
    color?: string;
    stock: number;
    price?: number;
    priceAdjustment?: number;
    isActive: boolean;
  }[];
  isActive: boolean;
  isFeatured: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: { id: string; name: string; email: string };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantSize?: string;
  variantColor?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  orders?: { id: string }[];
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

export interface CreateVariantDto {
  size: string;
  color: string;
  sku: string;
  stock: number;
  priceAdjustment?: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  gender?: "MEN" | "WOMEN" | "UNISEX";
  isFeatured?: boolean;
  variants?: CreateVariantDto[];
}

export interface UploadResult {
  message: string;
  images: {
    id: string;
    url: string;
    isMain: boolean;
    cloudinaryPublicId: string;
  }[];
}

export interface CreatePromotionDto {
  code: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom: string;
  validTo: string;
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {
  isActive?: boolean;
}

export interface CreateStaffDto {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface UpdateSettingsDto {
  storeName?: string;
  storeEmail?: string;
  currency?: string;
  notifyOrder?: boolean;
  notifyLowStock?: boolean;
  notifyReview?: boolean;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  storeEmail: string;
  currency: string;
  notifyOrder: boolean;
  notifyLowStock: boolean;
  notifyReview: boolean;
  updatedAt: string;
}

// Export singleton instance
export const adminAPI = new AdminAPI();
