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
      // Fetch enough products to create a decent loop
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
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
      <p className="text-gray-500 max-w-2xl mx-auto">
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

  // Duplicate products for infinite loop
  // We need enough duplicates to fill the screen + buffer
  const marqueeProducts = [...products, ...products, ...products];

  return (
    <section className="py-24 bg-[#F8F6F3] overflow-hidden">
      <SectionHeader />

      {/* Marquee Container with Gradient Masks for fade effect */}
      <div className="relative w-full">
        {/* Left Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 z-10 bg-linear-to-r from-[#F8F6F3] to-transparent pointer-events-none" />
        {/* Right Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 z-10 bg-linear-to-l from-[#F8F6F3] to-transparent pointer-events-none" />

        {/* Scrolling Track */}
        <div className="flex overflow-hidden group">
          <motion.div
            className="flex gap-4 md:gap-6 px-4"
            animate={{
              x: ["0%", "-33.333%"], // Move by one set of products
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: products.length * 3, // Adjust speed based on number of products
                ease: "linear",
              },
            }}
            // Pause animation on hover
            style={{
              width: "max-content",
            }}
            whileHover={{ animationPlayState: "paused" }} // Note: Framer Motion interactions might need CSS for pause on hover perfectly, but let's try a CSS override approach or just speed modification if needed.
            // Actually, Framer Motion doesn't support 'whileHover' for pausing an infinite 'animate'.
            // We'll use a CSS class for the hover-pause or use the 'hover' variant if we were using variants,
            // but for a simple loop, often CSS animation is smoother for the pause.
            // Let's stick to Framer Motion for the movement but wrapper for pause.
          >
            {marqueeProducts.map((product, index) => (
              <ProductCard
                key={`${product.id}-${index}`}
                product={product}
                className="w-[260px] md:w-[320px] shrink-0 transition-opacity duration-300 hover:opacity-100"
              />
            ))}
          </motion.div>
        </div>

        {/* Hover Hint */}
        <div className="text-center mt-8 text-xs uppercase tracking-widest text-gray-400 opacity-0 md:opacity-50">
          Scrolls infinitely • Hover to shop
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
