"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const res = await fetch(`${API_BASE_URL}/products/featured?limit=8`);
        if (!res.ok) throw new Error("Failed to fetch featured products");
        const data = await res.json();

        // Map API response to frontend Product interface
        const mappedProducts: Product[] = data.map((item: Record<string, unknown>) => ({
          id: item.id as string,
          name: item.name as string,
          slug: item.slug as string,
          description: (item.description as string) || "",
          price: Number(item.basePrice),
          categoryId: item.categoryId as string,
          category: item.category as { id: string; name: string; slug: string } | undefined,
          images: ((item.images as Array<Record<string, unknown>>) || []).map((img) => ({
            id: img.id as string,
            url: img.url as string,
            alt: (img.altText as string) || undefined,
            isPrimary: (img.isMain as boolean) || false,
          })),
          variants: ((item.variants as Array<Record<string, unknown>>) || []).map((v) => ({
            id: v.id as string,
            sku: v.sku as string,
            size: (v.size as string) || undefined,
            color: (v.color as string) || undefined,
            stock: v.stock as number,
            price: Number(item.basePrice) + Number(v.priceAdjustment || 0),
          })),
          isActive: item.isActive as boolean,
          isFeatured: item.isFeatured as boolean,
        }));

        setProducts(mappedProducts);
        setError(null);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-[#F8F6F3]">
        <div className="container-width text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Discover the pieces everyone is talking about. Limited edition drops and bestsellers.
          </p>
        </div>
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
        <div className="container-width text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Discover the pieces everyone is talking about. Limited edition drops and bestsellers.
          </p>
        </div>
        <div className="container-width flex justify-center py-12 border-2 border-dashed border-red-300 rounded-xl bg-red-50">
          <p className="text-red-500">Error loading products: {error}</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-20 bg-[#F8F6F3]">
        <div className="container-width text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Discover the pieces everyone is talking about. Limited edition drops and bestsellers.
          </p>
        </div>
        <div className="container-width flex justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <p className="text-gray-400">No featured products available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#F8F6F3]">
      <div className="container-width text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Discover the pieces everyone is talking about. Limited edition drops and bestsellers.
        </p>
      </div>
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
