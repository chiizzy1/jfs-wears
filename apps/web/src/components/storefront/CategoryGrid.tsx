"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

// Fallback image when category has no uploaded image
const FALLBACK_IMAGE = "/hero.png";

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Category[]>("/categories");
      // Filter to only categories with images (admin-uploaded), or take first 3
      setCategories(data.slice(0, 3));
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(getErrorMessage(err));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const SectionHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-4 px-4 md:px-0">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3 block">Collections</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Shop by Category</h2>
      </div>
      <Link
        href="/shop"
        className="group flex items-center text-xs font-bold uppercase tracking-[0.15em] hover:text-gray-600 transition-colors"
      >
        View All Collections
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="container-width">
          <SectionHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 h-[600px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`bg-gray-100 animate-pulse ${i === 1 ? "md:col-span-2 lg:col-span-2" : ""}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-white">
        <div className="container-width">
          <SectionHeader />
          <ErrorFallback variant="card" title="Failed to load categories" description={error} onRetry={fetchCategories} />
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-24 bg-white">
        <div className="container-width">
          <SectionHeader />
          <div className="flex justify-center py-20 border border-dashed border-gray-200">
            <p className="text-gray-400 text-xs uppercase tracking-widest">No categories available</p>
          </div>
        </div>
      </section>
    );
  }

  // First category is the main large one
  const mainCategory = categories[0];
  const sideCategories = categories.slice(1, 3);

  return (
    <section className="py-24 bg-white">
      <div className="container-width">
        <SectionHeader />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-1 md:gap-2 h-auto md:h-[700px]">
          {/* Main Category - Dominant Visual */}
          <div className="lg:col-span-8 relative group overflow-hidden h-[400px] md:h-full">
            <Link href={`/shop?category=${mainCategory.slug}`} className="block w-full h-full">
              <Image
                src={mainCategory.imageUrl || FALLBACK_IMAGE}
                alt={mainCategory.name}
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                <span className="inline-block text-white/90 text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  Featured Collection
                </span>
                <h3 className="text-4xl md:text-6xl lg:text-7xl text-white font-medium tracking-tighter mb-4">
                  {mainCategory.name}
                </h3>
                <div className="h-0 group-hover:h-8 overflow-hidden transition-all duration-300">
                  <span className="text-white text-sm font-medium border-b border-white pb-1">Shop Collection</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Side Categories - Vertical Stack */}
          <div className="lg:col-span-4 flex flex-col gap-1 md:gap-2 h-full">
            {sideCategories.map((cat) => (
              <div key={cat.id} className="relative flex-1 group overflow-hidden min-h-[300px]">
                <Link href={`/shop?category=${cat.slug}`} className="block w-full h-full">
                  <Image
                    src={cat.imageUrl || FALLBACK_IMAGE}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-60" />

                  <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full">
                    <h3 className="text-3xl md:text-4xl text-white font-medium tracking-tight mb-2">{cat.name}</h3>
                    <span className="inline-flex items-center text-white/80 text-xs font-bold uppercase tracking-[0.15em] group-hover:text-white transition-colors">
                      Shop Now{" "}
                      <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
