"use client";

import { Suspense } from "react";
import ProductCard from "@/components/storefront/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/use-search";
import { SearchFilters } from "@/components/search/SearchFilters";

function SearchContent() {
  const {
    products,
    categories,
    isLoading,
    totalPages,
    query,
    category,
    gender,
    sortBy,
    page,
    localFilters,
    setLocalFilters,
    updateFilter,
    applyPriceFilter,
    clearFilters,
  } = useSearch();

  const hasActiveFilters = !!(category || gender || localFilters.minPrice || localFilters.maxPrice);

  return (
    <div className="min-h-screen bg-secondary pt-24 pb-8">
      <div className="container-width">
        {/* Header */}
        <div className="mb-12 border-b border-gray-100 pb-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Search Results</p>
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight uppercase">{query || "All Products"}</h1>
            <span className="text-xs text-gray-400 font-mono">({products.length})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <SearchFilters
              categories={categories}
              activeCategory={category}
              activeGender={gender}
              localFilters={localFilters}
              setLocalFilters={setLocalFilters}
              sortBy={sortBy}
              onUpdateFilter={updateFilter}
              onApplyPriceFilter={applyPriceFilter}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <div className="bg-white rounded-none p-12 text-center border border-dashed border-gray-200">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-none flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-medium mb-2">No products found</h2>
                <p className="text-muted-foreground mb-6 text-sm">Try adjusting your filters or search term.</p>
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateFilter("page", p.toString())}
                        className={`w-10 h-10 rounded-none font-medium transition-colors text-sm ${
                          page === p ? "bg-black text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-secondary pt-24 pb-8">
          <div className="container-width">
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
