import { apiClient, ApiError } from "@/lib/api-client";

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ColorGroupImage {
  id: string;
  url: string;
  alt?: string;
  isMain: boolean;
}

export interface ColorGroup {
  id: string;
  colorName: string;
  colorHex?: string;
  images: ColorGroupImage[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    alt?: string;
    isPrimary: boolean;
  }[];
  colorGroups: ColorGroup[];
  variants: {
    id: string;
    sku: string;
    size?: string;
    color?: string;
    stock: number;
    price: number;
  }[];
  isActive: boolean;
  isFeatured: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

// API response types
interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  images?: Array<{ id: string; url: string; altText?: string; isMain?: boolean }>;
  colorGroups?: Array<{
    id: string;
    colorName: string;
    colorHex?: string;
    images: Array<{ id: string; url: string; altText?: string; isMain?: boolean }>;
  }>;
  variants?: Array<{
    id: string;
    sku: string;
    size?: string;
    color?: string;
    stock: number;
    priceAdjustment?: number;
  }>;
  isActive: boolean;
  isFeatured: boolean;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
}

// Helper function to map API product response to frontend Product interface
function mapApiProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    description: apiProduct.description || "",
    price: Number(apiProduct.basePrice),
    categoryId: apiProduct.categoryId,
    category: apiProduct.category,
    images: (apiProduct.images || []).map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.altText || undefined,
      isPrimary: img.isMain || false,
    })),
    colorGroups: (apiProduct.colorGroups || []).map((cg) => ({
      id: cg.id,
      colorName: cg.colorName,
      colorHex: cg.colorHex,
      images: (cg.images || []).map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.altText || undefined,
        isMain: img.isMain || false,
      })),
    })),
    variants: (apiProduct.variants || []).map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size || undefined,
      color: v.color || undefined,
      stock: v.stock,
      price: Number(apiProduct.basePrice) + Number(v.priceAdjustment || 0),
    })),
    isActive: apiProduct.isActive,
    isFeatured: apiProduct.isFeatured,
  };
}

export async function fetchProducts(params?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  page?: number;
  minPrice?: number;
  maxPrice?: number;
  gender?: string;
  search?: string;
}): Promise<{ products: Product[]; total: number; totalPages: number }> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("categoryId", params.category);
  if (params?.featured) searchParams.set("featured", "true");
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.offset) searchParams.set("page", Math.floor((params.offset || 0) / (params?.limit || 12) + 1).toString());
  if (params?.minPrice) searchParams.set("minPrice", params.minPrice.toString());
  if (params?.maxPrice) searchParams.set("maxPrice", params.maxPrice.toString());
  if (params?.gender) searchParams.set("gender", params.gender);
  if (params?.search) searchParams.set("search", params.search);

  try {
    const data = await apiClient.get<PaginatedResponse<ApiProduct> | ApiProduct[]>(`/products?${searchParams.toString()}`);

    // API returns { items, total, page, ... } structure or array
    const items = Array.isArray(data) ? data : data.items || [];
    const products = items.map(mapApiProduct);
    const total = Array.isArray(data) ? products.length : data.total || products.length;
    const limit = params?.limit || 12;
    const totalPages = Math.ceil(total / limit);

    return { products, total, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error);
    // Return empty results on error - don't crash
    return { products: [], total: 0, totalPages: 0 };
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const data = await apiClient.get<ApiProduct>(`/products/${slug}`);
    return mapApiProduct(data);
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    return await apiClient.get<Category[]>("/categories");
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const result = await fetchProducts({ featured: true, limit: 8 });
  return result.products;
}

// Re-export ApiError for convenience
export { ApiError };
