import { fetchProducts, fetchCategories } from "@/lib/api";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopSidebar, ShopMobileFilter } from "@/components/shop/ShopSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { notFound } from "next/navigation";

interface CollectionPageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

// Logic to map URL segments to API params
function parseSlug(slug: string[]) {
  const genderMap: Record<string, string> = {
    men: "men",
    women: "women",
    male: "men",
    female: "women",
  };

  const gender = genderMap[slug[0]?.toLowerCase()];
  const categorySlug = slug[1];

  return { gender, categorySlug };
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const { gender, categorySlug } = parseSlug(slug);
  const categories = await fetchCategories();

  const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;

  if (!gender && !category) return constructMetadata({ title: "Collection Not Found" });

  const genderLabel = gender === "men" ? "Men's" : gender === "women" ? "Women's" : "";
  const categoryLabel = category?.name || "";

  const title = `Shop ${genderLabel} ${categoryLabel} in Nigeria`.replace(/\s+/g, " ").trim();
  const description = `Discover JFS Wears' premium ${genderLabel} ${categoryLabel} collection. Best prices for ${
    categoryLabel || "fashion"
  } in Nigeria.`;

  return constructMetadata({
    title,
    description,
  });
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const { sort, minPrice, maxPrice } = await searchParams;
  const { gender, categorySlug } = parseSlug(slug);

  // Validate route: Must start with valid gender
  if (!gender) {
    notFound();
  }

  const categories = await fetchCategories();

  // Resolve category slug to ID for API safety (and to pass correct slug to UI)
  const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;

  // 404 if specific category requested but not found
  if (categorySlug && !category) {
    notFound();
  }

  // Fetch Products
  const { products } = await fetchProducts({
    gender,
    category: category?.slug, // Using slug as confirmed by ShopPage usage, or switch to id if needed
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });

  // Breadcrumbs
  const breadcrumbItems = [
    { label: "Shop", href: "/shop" },
    { label: gender === "men" ? "Men" : "Women", href: `/collections/${gender}` },
  ];

  if (category) {
    breadcrumbItems.push({
      label: category.name,
      href: `/collections/${gender}/${category.slug}`,
    });
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-primary/5 pt-24 pb-4 px-4 md:px-8">
        <div className="container-width">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      <ShopHero category={category?.slug} gender={gender} categories={categories} />

      <div className="container-width py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Reuse Shop Pages existing sidebar infrastructure */}
          <ShopMobileFilter categories={categories} currentCategory={category?.slug} />
          <ShopSidebar categories={categories} currentCategory={category?.slug} />

          <div className="flex-1">
            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
