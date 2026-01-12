import HeroSection from "@/components/storefront/HeroSection";
import CategoryGrid from "@/components/storefront/CategoryGrid";
import FeaturedProducts from "@/components/storefront/FeaturedProducts";
import DynamicSections from "@/components/storefront/DynamicSections";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      <CategoryGrid />

      <FeaturedProducts />

      {/* Dynamic CMS Sections - rendered below "Trending Now" */}
      <DynamicSections />

      {/* Premium Value Strip */}
      <section className="py-8 bg-primary text-white">
        <div className="container-width">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-center">
            <span className="text-xs uppercase tracking-[0.2em]">Free Shipping Over ₦50,000</span>
            <span className="hidden md:block text-white/30">|</span>
            <span className="text-xs uppercase tracking-[0.2em]">2-3 Day Delivery</span>
            <span className="hidden md:block text-white/30">|</span>
            <span className="text-xs uppercase tracking-[0.2em]">Easy Returns</span>
          </div>
        </div>
      </section>
    </div>
  );
}
