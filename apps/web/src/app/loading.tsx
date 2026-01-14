import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/storefront/skeletons/ProductCardSkeleton";

export default function HomeLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Skeleton */}
      <div className="h-[90vh] bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-4 text-center max-w-2xl px-4 w-full">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-16 w-3/4 mx-auto" />
            <div className="flex justify-center gap-4 pt-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid Skeleton */}
      <div className="container-width py-24">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px]">
          <div className="lg:col-span-2 lg:row-span-2 bg-gray-100 relative">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="lg:col-span-1 lg:row-span-2 bg-gray-100 relative">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="lg:col-span-1 lg:row-span-1 bg-gray-100 relative">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="lg:col-span-1 lg:row-span-1 bg-gray-100 relative">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>

      {/* Featured Products Skeleton */}
      <div className="bg-secondary py-24">
        <div className="container-width">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Value Strip Skeleton */}
      <div className="py-8 bg-primary">
        <div className="container-width">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-center opacity-50">
            <Skeleton className="h-4 w-48 bg-white/20" />
            <span className="hidden md:block text-white/30">|</span>
            <Skeleton className="h-4 w-32 bg-white/20" />
            <span className="hidden md:block text-white/30">|</span>
            <Skeleton className="h-4 w-32 bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
