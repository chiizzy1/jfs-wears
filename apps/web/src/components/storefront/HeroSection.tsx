"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Premium Hero Section
 *
 * Mason Garments-inspired: Full-bleed imagery, cinematic text reveals, parallax effect
 */
export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1] as const, // Cubic bezier with const assertion
      },
    },
  };

  const clipPathVariants = {
    hidden: { clipPath: "inset(100% 0 0 0)", y: 20 },
    visible: {
      clipPath: "inset(0 0 0 0)",
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as const, // Dramatic ease out with const assertion
      },
    },
  };

  return (
    <section ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background Image - with Parallax & Subtle Zoom */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="relative h-full w-full"
        >
          <Image src="/hero.png" alt="JFS Wears Premium Collection" fill className="object-cover" priority quality={90} />
        </motion.div>
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      </motion.div>

      {/* Content - Bottom Aligned */}
      <div className="relative z-10 h-full min-h-screen container-width flex flex-col justify-end pb-24 md:pb-32 text-white">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start max-w-4xl"
        >
          {/* Eyebrow - Small & Elegant */}
          <motion.div variants={itemVariants} className="overflow-hidden mb-6">
            <span className="inline-block text-xs md:text-sm uppercase tracking-[0.3em] font-medium text-white/90 px-3 py-1 border border-white/20 backdrop-blur-sm">
              Spring/Summer 2026
            </span>
          </motion.div>

          {/* Main Heading - Split lines for grand reveal */}
          <div className="mb-8 overflow-hidden">
            <motion.h1 className="text-5xl md:text-7xl lg:text-8xl font-medium leading-[0.9] tracking-tight">
              <span className="block overflow-hidden">
                <motion.span variants={clipPathVariants} className="block">
                  Redefine Your
                </motion.span>
              </span>
              <span className="block overflow-hidden mt-2 md:mt-4">
                <motion.span variants={clipPathVariants} className="block text-white/90">
                  Style Identity.
                </motion.span>
              </span>
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-white/70 text-base md:text-lg mb-12 max-w-lg leading-relaxed font-light tracking-wide"
          >
            Premium streetwear crafted for the modern Nigerian. Experience unmatched quality, precision cutting, and timeless
            design that speaks before you do.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6">
            <Link
              href="/shop"
              className="group relative overflow-hidden inline-flex items-center justify-center bg-white text-black px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:text-white transition-colors duration-500"
            >
              <span className="relative z-10">Shop Collection</span>
              <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
            </Link>

            <Link
              href="/story"
              className="group inline-flex items-center justify-center px-8 py-4 text-xs uppercase tracking-[0.2em] font-medium text-white border border-white/30 hover:border-white transition-colors duration-300"
            >
              Our Story
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
