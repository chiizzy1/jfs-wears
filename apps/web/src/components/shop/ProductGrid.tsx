import Link from "next/link";
import ProductCard from "@/components/storefront/ProductCard";
import { Product } from "@/lib/api";
import { SortSelect } from "./SortSelect";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <main className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">
          Showing <span className="font-medium text-black">{products.length}</span> products
        </p>

        <SortSelect />
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-none border border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">No products found.</p>
          <Link href="/shop" className="text-black font-medium hover:underline mt-2 inline-block">
            Clear filters
          </Link>
        </div>
      )}
    </main>
  );
}
