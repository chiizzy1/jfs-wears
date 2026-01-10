import Link from "next/link";
import { Suspense } from "react";
import PriceFilter from "@/components/storefront/PriceFilter";
import { Category } from "@/lib/api";

interface ShopSidebarProps {
  categories: Category[];
  currentCategory?: string;
}

export function ShopSidebar({ categories, currentCategory }: ShopSidebarProps) {
  return (
    <aside className="lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl p-6 sticky top-24 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-lg mb-4 tracking-tight">Categories</h3>
        <ul className="space-y-2">
          <li>
            <Link
              href="/shop"
              className={`block py-2 px-3 rounded-lg transition-colors text-sm font-medium ${
                !currentCategory ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
            >
              All Products
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/shop?category=${cat.slug}`}
                className={`block py-2 px-3 rounded-lg transition-colors text-sm font-medium ${
                  currentCategory === cat.slug ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Separator */}
        <hr className="my-6 border-gray-100" />

        <h3 className="font-bold text-lg mb-4 tracking-tight">Filter By</h3>

        {/* Price Filter */}
        <Suspense fallback={<div className="h-20 animate-pulse bg-gray-50 rounded-lg" />}>
          <PriceFilter />
        </Suspense>
      </div>
    </aside>
  );
}
