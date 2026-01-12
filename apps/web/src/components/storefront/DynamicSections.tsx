"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    variants: [],
    isActive: true,
    isFeatured: false,
  };
}

// Single Section Carousel
function SectionCarousel({ section }: { section: StorefrontSection }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({
      playOnInit: true,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      speed: 1,
    }),
  ]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  if (section.products.length === 0) {
    return null; // Don't render empty sections
  }

  // Duplicate products for smooth infinite scroll
  const displayProducts = [...section.products, ...section.products, ...section.products];

  return (
    <section className="py-16 bg-white overflow-hidden">
      {/* Section Header */}
      <div className="container-width mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{section.title}</h2>
            {section.subtitle && <p className="text-gray-500 mt-1 text-sm md:text-base">{section.subtitle}</p>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              className="p-2 border border-gray-200 hover:border-black transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="p-2 border border-gray-200 hover:border-black transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y gap-4 md:gap-6 px-4">
            {displayProducts.map((product, index) => (
              <div key={`${product.id}-${index}`} className="flex-[0_0_260px] md:flex-[0_0_300px] min-w-0">
                <ProductCard product={mapSectionProduct(product)} />
              </div>
            ))}
          </div>
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
      <div className="py-16">
        <div className="container-width">
          <div className="h-8 w-48 bg-gray-200 animate-pulse mb-8" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[260px] aspect-[3/4] bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || sections.length === 0) {
    return null; // Don't show error, just hide if no sections
  }

  return (
    <>
      {sections.map((section) => (
        <SectionCarousel key={section.id} section={section} />
      ))}
    </>
  );
}
