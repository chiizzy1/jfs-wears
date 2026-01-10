"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

// Fallback images for categories without images
const fallbackImages: Record<string, string> = {
  default: "/hero.png",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Category[]>("/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Mock data for development if API fails (optional, but good for demo)
      // setCategories(mockCategories);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4"
    >
      <div>
        <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Curated Collections</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Shop by Category</h2>
      </div>
      <Link
        href="/shop"
        className="text-sm uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors hidden md:block"
      >
        View All
      </Link>
    </motion.div>
  );

  if (loading) {
    return (
      <section className="py-24 bg-white overflow-hidden">
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

  // Get first category for main display, rest for side display
  const mainCategory = categories[0];
  const sideCategories = categories.slice(1, 3);

  return (
    <section className="py-24 bg-white">
      <div className="container-width">
        <SectionHeader />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 h-[600px]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Main Category */}
          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-2 lg:col-span-2 h-full relative group overflow-hidden"
          >
            <Link href={`/shop?category=${mainCategory.slug}`} className="block w-full h-full">
              <Image
                src={mainCategory.imageUrl || fallbackImages.default}
                alt={mainCategory.name}
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end items-start">
                <div className="overflow-hidden">
                  <h3 className="text-4xl md:text-6xl font-medium text-white mb-4 transform translate-y-0 transition-transform duration-500">
                    {mainCategory.name}
                  </h3>
                </div>
                <span className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300">
                  Explore Collection
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Side Categories */}
          {sideCategories.length > 0 && (
            <div className="flex flex-col gap-1 h-full col-span-1">
              {sideCategories.map((cat) => (
                <motion.div key={cat.id} variants={itemVariants} className="h-1/2 relative group overflow-hidden">
                  <Link href={`/shop?category=${cat.slug}`} className="block w-full h-full">
                    <Image
                      src={cat.imageUrl || fallbackImages.default}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

                    <div className="absolute inset-0 p-8 flex flex-col justify-end items-start">
                      <h3 className="text-2xl md:text-3xl font-medium text-white mb-2">{cat.name}</h3>
                      <span className="text-white/80 text-xs uppercase tracking-widest border-b border-white/0 group-hover:border-white transition-all duration-300">
                        Shop Now
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
