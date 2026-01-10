import Link from "next/link";
import Image from "next/image";

/**
 * Premium Hero Section
 *
 * Mason Garments-inspired: Full-bleed imagery, minimal text, single CTA
 */
export default function HeroSection() {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Image - Full Bleed */}
      <div className="absolute inset-0">
        <Image src="/hero.png" alt="JFS Wears Premium Collection" fill className="object-cover" priority />
        {/* Subtle gradient overlay - less aggressive than before */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* Content - Minimal, Bottom Aligned */}
      <div className="relative h-full container-width flex flex-col justify-end pb-16 text-white">
        {/* Small eyebrow text */}
        <span className="text-xs uppercase tracking-[0.25em] text-white/80 mb-4">New Collection</span>

        {/* Main heading - Clean typography, no gradients */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium mb-6 leading-[1.1] max-w-2xl tracking-[0.02em]">
          Redefine Your
          <br />
          Style Identity
        </h1>

        {/* Subtitle - Simple, no colorful effects */}
        <p className="text-white/70 text-base md:text-lg mb-10 max-w-lg leading-relaxed">
          Premium streetwear crafted for the modern Nigerian. Experience unmatched quality and timeless design.
        </p>

        {/* Single CTA - Black button, premium style */}
        <div className="flex gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-white text-black px-10 py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-white/90 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
