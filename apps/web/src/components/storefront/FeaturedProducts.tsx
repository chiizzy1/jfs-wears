"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/api";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { ErrorFallback } from "@/components/ui/error-fallback";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

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

  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({
      playOnInit: true,
      stopOnInteraction: false,
      stopOnMouseEnter: true, // Pauses on hover
      speed: 1, // Slower speed
    }),
  ]);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<ApiProduct[]>("/products/featured?limit=10");
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
      <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Trending Now</h2>
      <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
        Discover the pieces everyone is talking about. Limited edition drops and bestsellers.
      </p>
    </div>
  );

  if (loading) {
    return (
      <section className="py-24 bg-[#F8F6F3] overflow-hidden">
        <SectionHeader />
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="min-w-[280px] md:min-w-[340px] rounded-none aspect-3/4 animate-pulse bg-gray-200" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-[#F8F6F3]">
        <SectionHeader />
        <div className="container-width">
          <ErrorFallback variant="card" title="Failed to load products" description={error} onRetry={fetchFeaturedProducts} />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-24 bg-[#F8F6F3]">
        <SectionHeader />
        <div className="container-width flex justify-center py-12 border border-dashed border-gray-300">
          <p className="text-gray-400 uppercase tracking-widest text-xs">No featured products available</p>
        </div>
      </section>
    );
  }

  // Duplicate for density if needed, though loop: true handles most cases.
  // We'll duplicate once to ensure smooth looping even on wide screens.
  const marqueeProducts = [...products, ...products, ...products];

  return (
    <section className="py-24 bg-[#F8F6F3] overflow-hidden">
      <SectionHeader />

      <div className="relative w-full">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 z-10 bg-linear-to-r from-[#F8F6F3] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 z-10 bg-linear-to-l from-[#F8F6F3] to-transparent pointer-events-none" />

        {/* Embla Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y gap-4 md:gap-6 px-4">
            {marqueeProducts.map((product, index) => (
              <div key={`${product.id}-${index}`} className="flex-[0_0_260px] md:flex-[0_0_320px] min-w-0">
                <ProductCard product={product} className="transition-opacity duration-300 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 text-xs uppercase tracking-widest text-gray-400 opacity-50">
          Scrolls <span className="hidden md:inline">infinitely</span> • Drag to explore
        </div>
      </div>
    </section>
  );
}
