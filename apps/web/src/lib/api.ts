const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface ApiResponse<T> {
  data: T;
  message?: string;
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

// Helper function to map API product response to frontend Product interface
function mapApiProduct(apiProduct: Record<string, unknown>): Product {
  return {
    id: apiProduct.id as string,
    name: apiProduct.name as string,
    slug: apiProduct.slug as string,
    description: (apiProduct.description as string) || "",
    price: Number(apiProduct.basePrice),
    categoryId: apiProduct.categoryId as string,
    category: apiProduct.category as { id: string; name: string; slug: string } | undefined,
    images: ((apiProduct.images as Array<Record<string, unknown>>) || []).map((img) => ({
      id: img.id as string,
      url: img.url as string,
      alt: (img.altText as string) || undefined,
      isPrimary: (img.isMain as boolean) || false,
    })),
    variants: ((apiProduct.variants as Array<Record<string, unknown>>) || []).map((v) => ({
      id: v.id as string,
      sku: v.sku as string,
      size: (v.size as string) || undefined,
      color: (v.color as string) || undefined,
      stock: v.stock as number,
      price: Number(apiProduct.basePrice) + Number(v.priceAdjustment || 0),
    })),
    isActive: apiProduct.isActive as boolean,
    isFeatured: apiProduct.isFeatured as boolean,
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

  const url = `${API_BASE_URL}/products?${searchParams.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();

    // API returns { items, total, page, ... } structure
    const items = data.items || data;
    const products = (Array.isArray(items) ? items : []).map(mapApiProduct);
    const total = data.total || products.length;
    const limit = params?.limit || 12;
    const totalPages = Math.ceil(total / limit);

    return { products, total, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0, totalPages: 0 };
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    // The API endpoint is /products/:slug (not /products/slug/:slug)
    const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return mapApiProduct(data);
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const result = await fetchProducts({ featured: true, limit: 8 });
  return result.products;
}
