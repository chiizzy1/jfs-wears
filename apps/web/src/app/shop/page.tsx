import { fetchProducts, fetchCategories } from "@/lib/api";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopSidebar, ShopMobileFilter } from "@/components/shop/ShopSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    gender?: string;
    size?: string;
    color?: string;
    isOnSale?: string;
    search?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categories = await fetchCategories();

  const categoryName = params.category ? categories.find((c) => c.slug === params.category)?.name : undefined;

  const genderLabel = params.gender === "men" ? "Men's" : params.gender === "women" ? "Women's" : undefined;

  const titleParts = [genderLabel, categoryName, "Shop"].filter(Boolean);
  const title = titleParts.join(" ");

  return constructMetadata({
    title: title || "Shop",
    description: `Browse our extensive collection of ${title}. Premium quality fashion for everyone.`,
  });
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [productsResult, categories] = await Promise.all([
    fetchProducts({
      category: params.category,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      gender: params.gender,
      size: params.size,
      color: params.color,
      isOnSale: params.isOnSale === "true",
      search: params.search,
    }),
    fetchCategories(),
  ]);

  const products = productsResult.products;

  // breadcrumb items
  const breadcrumbItems = [{ label: "Shop", href: "/shop" }];
  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category);
    if (cat) {
      breadcrumbItems.push({ label: cat.name, href: `/shop?category=${cat.slug}` });
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-primary/5 pt-24 pb-4 px-4 md:px-8">
        <div className="container-width">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      <ShopHero category={params.category} gender={params.gender} categories={categories} />

      <div className="container-width py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <ShopMobileFilter categories={categories} currentCategory={params.category} />
          <ShopSidebar categories={categories} currentCategory={params.category} />
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
