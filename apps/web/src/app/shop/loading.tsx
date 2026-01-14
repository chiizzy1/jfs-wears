import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/storefront/skeletons/ProductCardSkeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero Skeleton */}
      <div className="h-[40vh] bg-gray-100 relative overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="container-width py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8 hidden lg:block">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[...Array(9)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
