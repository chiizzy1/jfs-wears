"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/api";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  images: Array<{ id: string; url: string; altText?: string; isMain?: boolean }>;
  variants: Array<{
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

function mapApiProduct(item: ApiProduct): Product {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description || "",
    price: Number(item.basePrice),
    categoryId: item.categoryId,
    category: item.category,
    images: (item.images || []).map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.altText || undefined,
      isPrimary: img.isMain || false,
    })),
    variants: (item.variants || []).map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size || undefined,
      color: v.color || undefined,
      stock: v.stock,
      price: Number(item.basePrice) + Number(v.priceAdjustment || 0),
    })),
    isActive: item.isActive,
    isFeatured: item.isFeatured,
  };
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<ApiProduct[]>("/products/featured?limit=8");
      const mappedProducts = data.map(mapApiProduct);
      setProducts(mappedProducts);
    } catch (err) {
      console.error("Error fetching featured products:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const SectionHeader = () => (
    <div className="container-width text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
      <p className="text-gray-500 max-w-2xl mx-auto">
        Discover the pieces everyone is talking about. Limited edition drops and bestsellers.
      </p>
    </div>
  );

  if (loading) {
    return (
      <section className="py-20 bg-[#F8F6F3]">
        <SectionHeader />
        <div className="container-width">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-gray-200" />
                <div className="p-4">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-5 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-[#F8F6F3]">
        <SectionHeader />
        <div className="container-width">
          <ErrorFallback variant="card" title="Failed to load products" description={error} onRetry={fetchFeaturedProducts} />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-20 bg-[#F8F6F3]">
        <SectionHeader />
        <div className="container-width flex justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <p className="text-gray-400">No featured products available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#F8F6F3]">
      <SectionHeader />
      <div className="container-width">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
