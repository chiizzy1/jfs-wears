"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Fallback images for categories without images
const fallbackImages: Record<string, string> = {
  default: "/hero.png",
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Set empty array on error - component will show empty state
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container-width">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
              <p className="text-gray-500">Curated essentials for every occasion.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[600px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`bg-gray-200 rounded-2xl animate-pulse ${i === 1 ? "md:col-span-2 lg:col-span-2" : ""}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container-width">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
              <p className="text-gray-500">Curated essentials for every occasion.</p>
            </div>
          </div>
          <div className="flex justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-400">No categories available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  // Get first category for main display, rest for side display
  const mainCategory = categories[0];
  const sideCategories = categories.slice(1, 3);

  return (
    <section className="py-20 bg-white">
      <div className="container-width">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-gray-500">Curated essentials for every occasion.</p>
          </div>
          <Link
            href="/shop"
            className="text-primary font-medium hover:underline decoration-accent underline-offset-4 hidden md:block"
          >
            View All Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Main Category */}
          <Link
            href={`/shop?category=${mainCategory.slug}`}
            className="group relative col-span-1 md:col-span-2 lg:col-span-2 h-full overflow-hidden rounded-2xl block"
          >
            <Image
              src={mainCategory.imageUrl || fallbackImages.default}
              alt={mainCategory.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-bold mb-2">{mainCategory.name}</h3>
              <span className="inline-block px-4 py-2 bg-white text-black text-sm font-bold rounded-full group-hover:bg-accent group-hover:text-white transition-colors">
                Explore
              </span>
            </div>
          </Link>

          {/* Side Categories */}
          {sideCategories.length > 0 && (
            <div className="flex flex-col gap-6 h-full col-span-1">
              {sideCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative h-1/2 overflow-hidden rounded-2xl block"
                >
                  <Image
                    src={cat.imageUrl || fallbackImages.default}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                    <span className="text-sm font-medium border-b border-white pb-0.5 group-hover:text-accent group-hover:border-accent transition-colors">
                      Shop Now
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
