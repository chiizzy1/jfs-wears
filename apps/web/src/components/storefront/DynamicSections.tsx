"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

interface SectionProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  image: string | null;
  category: { id: string; name: string; slug: string } | null;
}

interface StorefrontSection {
  id: string;
  title: string;
  subtitle?: string;
  type: "FEATURED" | "CATEGORY" | "COLLECTION";
  categoryId?: string;
  mediaUrl?: string;
  order: number;
  isActive: boolean;
  maxProducts: number;
  category?: { id: string; name: string; slug: string };
  products: SectionProduct[];
}

interface StorefrontData {
  heroes: unknown[];
  sections: StorefrontSection[];
}

// Map section product to ProductCard format
function mapSectionProduct(item: SectionProduct) {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: "",
    price: Number(item.basePrice),
    categoryId: item.category?.id || "",
    category: item.category || undefined,
    images: item.image ? [{ id: "1", url: item.image, isPrimary: true }] : [],
    // Provide a default variant with stock to avoid "Sold Out" display
    variants: [{ id: "default", sku: "default", stock: 100, price: Number(item.basePrice) }],
    isActive: true,
    isFeatured: false,
    colorGroups: [],
  };
}

// Single Section Carousel - Matches "Trending Now" styling exactly
function SectionCarousel({ section }: { section: StorefrontSection }) {
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({
      playOnInit: true,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      speed: 1,
    }),
  ]);

  if (section.products.length === 0) {
    return null;
  }

  // Duplicate products for smooth infinite scroll (same as Trending Now)
  const marqueeProducts = [...section.products, ...section.products, ...section.products];

  return (
    <section className="py-24 bg-[#F8F6F3] overflow-hidden">
      {/* Section Header - Left Aligned */}
      <div className="container-width mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{section.title}</h2>
        {section.subtitle && <p className="text-gray-500 max-w-2xl text-sm md:text-base">{section.subtitle}</p>}
      </div>

      {/* Carousel - Same as Trending Now */}
      <div className="relative w-full">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 z-10 bg-linear-to-r from-[#F8F6F3] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 z-10 bg-linear-to-l from-[#F8F6F3] to-transparent pointer-events-none" />

        {/* Embla Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y gap-0.5 px-4">
            {marqueeProducts.map((product, index) => (
              <div key={`${product.id}-${index}`} className="flex-[0_0_260px] md:flex-[0_0_320px] min-w-0">
                <ProductCard product={mapSectionProduct(product)} className="transition-opacity duration-300 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Scrolls infinitely text - Same as Trending Now */}
        <div className="text-center mt-8 text-xs uppercase tracking-widest text-gray-400 opacity-50">
          Scrolls <span className="hidden md:inline">infinitely</span> • Drag to explore
        </div>
      </div>
    </section>
  );
}

// Main Component: Renders all dynamic sections
export default function DynamicSections() {
  const [sections, setSections] = useState<StorefrontSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        const data = await apiClient.get<StorefrontData>("/storefront");
        // Filter to only CATEGORY type sections (not FEATURED since that's handled by FeaturedProducts)
        const categorySections = data.sections.filter((s) => s.type === "CATEGORY" && s.products.length > 0);
        setSections(categorySections);
      } catch (err) {
        console.error("Error fetching storefront sections:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchStorefront();
  }, []);

  if (loading) {
    return (
      <div className="py-24 bg-[#F8F6F3]">
        <div className="container-width">
          <div className="h-8 w-48 bg-gray-200 animate-pulse mb-12" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="min-w-[280px] md:min-w-[340px] rounded-none aspect-3/4 animate-pulse bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section) => (
        <SectionCarousel key={section.id} section={section} />
      ))}
    </>
  );
}
