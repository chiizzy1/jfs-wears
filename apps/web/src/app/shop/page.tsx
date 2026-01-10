import { fetchProducts, fetchCategories } from "@/lib/api";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopSidebar } from "@/components/shop/ShopSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";

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
      <ShopHero category={params.category} gender={params.gender} categories={categories} />

      <div className="container-width py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <ShopSidebar categories={categories} currentCategory={params.category} />
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
