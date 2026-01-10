import { Suspense } from "react";
import { fetchProducts, fetchCategories } from "@/lib/api";
import ProductCard from "@/components/storefront/ProductCard";
import PriceFilter from "@/components/storefront/PriceFilter";
import Link from "next/link";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    gender?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [productsResult, categories] = await Promise.all([
    fetchProducts({
      category: params.category,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      gender: params.gender,
    }),
    fetchCategories(),
  ]);

  const products = productsResult.products;

  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero Banner */}
      <div className="bg-primary text-white py-16">
        <div className="container-width text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {params.category
              ? categories.find((c) => c.slug === params.category)?.name || "Shop"
              : params.gender
              ? params.gender === "men"
                ? "Men's Collection"
                : "Women's Collection"
              : "All Products"}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Discover our curated collection of premium fashion pieces.</p>
        </div>
      </div>

      <div className="container-width py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/shop"
                    className={`block py-2 px-3 rounded-lg transition-colors ${
                      !params.category ? "bg-primary text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/shop?category=${cat.slug}`}
                      className={`block py-2 px-3 rounded-lg transition-colors ${
                        params.category === cat.slug ? "bg-primary text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Price Filter */}
              <PriceFilter />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500">
                Showing <span className="font-medium text-primary">{products.length}</span> products
              </p>
              <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white">
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found.</p>
                <Link href="/shop" className="text-accent hover:underline mt-2 inline-block">
                  View all products
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
