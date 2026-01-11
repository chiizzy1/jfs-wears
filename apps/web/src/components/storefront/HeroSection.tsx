"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPublicStorefront, HeroSlide } from "@/services/storefront-api";

// Fallback hero for when CMS has no data
const FALLBACK_HERO: HeroSlide = {
  id: "fallback",
  headline: "Redefine Your Style Identity.",
  subheadline:
    "Premium streetwear crafted for the modern Nigerian. Experience unmatched quality, precision cutting, and timeless design that speaks before you do.",
  ctaText: "Shop Collection",
  ctaLink: "/shop",
  mediaUrl: "/hero.png",
  mediaType: "IMAGE",
  order: 0,
  isActive: true,
};

/**
 * Premium Hero Section with CMS Integration
 *
 * Supports: Images, Videos, GIFs
 * Features: Auto-advancement, parallax, cinematic reveals
 */
export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch CMS data
  useEffect(() => {
    async function fetchHeroes() {
      try {
        const data = await getPublicStorefront();
        if (data.heroes && data.heroes.length > 0) {
          setSlides(data.heroes);
        } else {
          setSlides([FALLBACK_HERO]);
        }
      } catch {
        setSlides([FALLBACK_HERO]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHeroes();
  }, []);

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const currentSlide = slides[currentIndex] || FALLBACK_HERO;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] as const },
    },
  };

  const clipPathVariants = {
    hidden: { clipPath: "inset(100% 0 0 0)", y: 20 },
    visible: {
      clipPath: "inset(0 0 0 0)",
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="relative min-h-screen w-full bg-black flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded mb-4" />
          <div className="h-16 w-96 bg-white/10 rounded" />
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background Media - with Parallax */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative h-full w-full"
          >
            {/* Render Image or Video based on mediaType */}
            {currentSlide.mediaType === "VIDEO" ? (
              <video
                key={currentSlide.mediaUrl}
                src={currentSlide.mediaUrl}
                poster={currentSlide.thumbnailUrl || undefined}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={currentSlide.mediaUrl}
                alt={currentSlide.headline}
                fill
                className="object-cover"
                priority
                quality={90}
                unoptimized={currentSlide.mediaUrl.endsWith(".gif")}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      </motion.div>

      {/* Navigation Arrows (show when multiple slides) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 text-white/60 hover:text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 text-white/60 hover:text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Content - Bottom Aligned */}
      <div className="relative z-10 h-full min-h-screen container-width flex flex-col justify-end pb-24 md:pb-32 text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-start max-w-4xl"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants} className="overflow-hidden mb-6">
              <span className="inline-block text-xs md:text-sm uppercase tracking-[0.3em] font-medium text-white/90 px-3 py-1 border border-white/20 backdrop-blur-sm">
                Spring/Summer 2026
              </span>
            </motion.div>

            {/* Main Heading */}
            <div className="mb-8 overflow-hidden">
              <motion.h1 className="text-5xl md:text-7xl lg:text-8xl font-medium leading-[0.9] tracking-tight">
                {currentSlide.headline.split(" ").slice(0, 2).join(" ") && (
                  <span className="block overflow-hidden">
                    <motion.span variants={clipPathVariants} className="block">
                      {currentSlide.headline
                        .split(" ")
                        .slice(0, Math.ceil(currentSlide.headline.split(" ").length / 2))
                        .join(" ")}
                    </motion.span>
                  </span>
                )}
                {currentSlide.headline.split(" ").length > 2 && (
                  <span className="block overflow-hidden mt-2 md:mt-4">
                    <motion.span variants={clipPathVariants} className="block text-white/90">
                      {currentSlide.headline
                        .split(" ")
                        .slice(Math.ceil(currentSlide.headline.split(" ").length / 2))
                        .join(" ")}
                    </motion.span>
                  </span>
                )}
              </motion.h1>
            </div>

            {/* Subtitle */}
            {currentSlide.subheadline && (
              <motion.p
                variants={itemVariants}
                className="text-white/70 text-base md:text-lg mb-12 max-w-lg leading-relaxed font-light tracking-wide"
              >
                {currentSlide.subheadline}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6">
              <Link
                href={currentSlide.ctaLink || "/shop"}
                className="group relative overflow-hidden inline-flex items-center justify-center bg-white text-black px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:text-white transition-colors duration-500"
              >
                <span className="relative z-10">{currentSlide.ctaText || "Shop Now"}</span>
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-12 h-1 transition-all duration-300 ${
                  idx === currentIndex ? "bg-white" : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
