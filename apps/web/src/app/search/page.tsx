"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/storefront/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeletons";
import { Product, fetchProducts, fetchCategories, Category } from "@/lib/api";
import { Button } from "@/components/ui/Button";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state from URL
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const gender = searchParams.get("gender") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  // Local filter state for form
  const [localFilters, setLocalFilters] = useState({
    minPrice: minPrice,
    maxPrice: maxPrice,
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts({
            search: query,
            category,
            gender: gender as "men" | "women" | "unisex" | undefined,
            page,
            limit: 12,
          }),
          fetchCategories(),
        ]);

        // Client-side price filtering (better done server-side in real app)
        let filtered = productsData.products;
        if (minPrice) {
          filtered = filtered.filter((p) => p.price >= parseInt(minPrice));
        }
        if (maxPrice) {
          filtered = filtered.filter((p) => p.price <= parseInt(maxPrice));
        }

        // Client-side sorting (better done server-side)
        if (sortBy === "price-low") {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
          filtered.sort((a, b) => b.price - a.price);
        }

        setProducts(filtered);
        setTotalPages(productsData.totalPages);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [query, category, gender, minPrice, maxPrice, sortBy, page]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 when filtering
    router.push(`/search?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (localFilters.minPrice) {
      params.set("minPrice", localFilters.minPrice);
    } else {
      params.delete("minPrice");
    }
    if (localFilters.maxPrice) {
      params.set("maxPrice", localFilters.maxPrice);
    } else {
      params.delete("maxPrice");
    }
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/search${query ? `?q=${query}` : ""}`);
    setLocalFilters({ minPrice: "", maxPrice: "" });
  };

  const hasActiveFilters = category || gender || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="container-width">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{query ? `Results for "${query}"` : "All Products"}</h1>
          <p className="text-gray-500">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold">Filters</h2>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-accent hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilter("category", "")}
                    className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !category ? "bg-accent text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter("category", cat.slug)}
                      className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        category === cat.slug ? "bg-accent text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Gender</h3>
                <div className="flex flex-wrap gap-2">
                  {["", "men", "women", "unisex"].map((g) => (
                    <button
                      key={g || "all"}
                      onClick={() => updateFilter("gender", g)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        gender === g ? "bg-primary text-white border-primary" : "border-gray-200 hover:border-primary"
                      }`}
                    >
                      {g === "" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Price Range (₦)</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minPrice}
                    onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxPrice}
                    onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={applyPriceFilter}>
                  Apply Price
                </Button>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-medium mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold mb-2">No products found</h2>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search term.</p>
                <Button variant="accent" onClick={clearFilters}>
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
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === p ? "bg-primary text-white" : "bg-white hover:bg-gray-100"
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
        <div className="min-h-screen bg-secondary py-8">
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
