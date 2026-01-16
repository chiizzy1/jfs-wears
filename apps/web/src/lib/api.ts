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
  bulkEnabled?: boolean;
  bulkPricingTiers?: { minQuantity: number; discountPercent: number }[];
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
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
  bulkEnabled?: boolean;
  bulkPricingTiers?: Array<{ minQuantity: number; discountPercent: number }>;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
}

// Helper function to map API product response to frontend Product interface
function mapApiProduct(apiProduct: ApiProduct): Product {
  const mappedProduct: Product = {
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
    variants: (apiProduct.variants || []).map((v) => {
      // Logic for variant pricing:
      // If the parent is on sale, does the variant inherit the discount structure?
      // Typically variants just adjust the base, but for now we'll keep simple variant logic
      // and maybe revisit if variants need their own specific sale overrides.
      // For now, variants add to the calculated base price.
      const basePrice = Number(apiProduct.basePrice);
      return {
        id: v.id,
        sku: v.sku,
        size: v.size || undefined,
        color: v.color || undefined,
        stock: v.stock,
        price: basePrice + Number(v.priceAdjustment || 0),
      };
    }),
    isActive: apiProduct.isActive,
    isFeatured: apiProduct.isFeatured,
    bulkEnabled: apiProduct.bulkEnabled,
    bulkPricingTiers: apiProduct.bulkPricingTiers?.map((tier) => ({
      minQuantity: tier.minQuantity,
      discountPercent: Number(tier.discountPercent),
    })),
    salePrice: apiProduct.salePrice ? Number(apiProduct.salePrice) : undefined,
    saleStartDate: apiProduct.saleStartDate,
    saleEndDate: apiProduct.saleEndDate,
  };

  // Determine effective pricing based on sale status
  const now = new Date();
  const salePrice = apiProduct.salePrice ? Number(apiProduct.salePrice) : undefined;
  const startDate = apiProduct.saleStartDate ? new Date(apiProduct.saleStartDate) : undefined;
  const endDate = apiProduct.saleEndDate ? new Date(apiProduct.saleEndDate) : undefined;

  const isSaleActive = salePrice !== undefined && (!startDate || startDate <= now) && (!endDate || endDate > now);

  if (isSaleActive && salePrice !== undefined) {
    mappedProduct.price = salePrice;
    mappedProduct.compareAtPrice = Number(apiProduct.basePrice);
  } else {
    mappedProduct.price = Number(apiProduct.basePrice);
    mappedProduct.compareAtPrice = undefined;
  }

  return mappedProduct;
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
  size?: string;
  color?: string;
  isOnSale?: boolean;
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
  if (params?.size) searchParams.set("size", params.size);
  if (params?.color) searchParams.set("color", params.color);
  if (params?.isOnSale) searchParams.set("isOnSale", "true");

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

export interface ReviewStats {
  count: number;
  average: number;
}

export async function fetchProductReviewStats(productId: string): Promise<ReviewStats> {
  try {
    const data = await apiClient.get<{ stats: ReviewStats }>(`/reviews/product/${productId}?limit=1`);
    return data.stats;
  } catch (error) {
    console.error("Error fetching review stats:", error);
    return { count: 0, average: 0 };
  }
}

export async function fetchRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
  try {
    const data = await apiClient.get<ApiProduct[]>(`/products/${productId}/related?limit=${limit}`);
    return data.map(mapApiProduct);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

// Re-export ApiError for convenience
export { ApiError };
