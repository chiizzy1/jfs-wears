import { ProductDetailSkeleton } from "@/components/storefront/skeletons/ProductDetailSkeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-secondary pt-24 pb-8">
      <ProductDetailSkeleton />
    </div>
  );
}
