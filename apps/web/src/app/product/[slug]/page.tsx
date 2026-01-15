import { notFound } from "next/navigation";
import { fetchProductBySlug } from "@/lib/api";
import ProductDetails from "@/components/storefront/ProductDetails";
import ProductReviews from "@/components/storefront/ProductReviews";
import RecentlyViewedTracker from "@/components/storefront/RecentlyViewedTracker";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { getProductSchema } from "@/lib/structured-data";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return constructMetadata({ title: "Product Not Found" });
  }

  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;

  return constructMetadata({
    title: product.name,
    description: product.description || `Buy ${product.name} at JFS Wears.`,
    image: primaryImage,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || "";

  // Prepare Schema
  const productSchema = getProductSchema({
    name: product.name,
    description: product.description,
    image: primaryImage,
    price: product.price,
    currency: "NGN",
    availability: product.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    url: `https://jfs-wears.com/product/${product.slug}`,
  });

  // Prepare Breadcrumbs
  const breadcrumbItems = [{ label: "Shop", href: "/shop" }];

  if (product.category) {
    breadcrumbItems.push({
      label: product.category.name,
      href: `/shop?category=${product.category.slug}`,
    });
  }

  breadcrumbItems.push({ label: product.name, href: `/product/${product.slug}` });

  return (
    <div className="min-h-screen bg-secondary pt-24 pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <div className="container-width">
        <Breadcrumbs items={breadcrumbItems} />

        <ProductDetails product={product} />

        {/* Product Reviews */}
        <div className="mt-32">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>

        {/* Track recently viewed */}
        <RecentlyViewedTracker
          productId={product.id}
          name={product.name}
          price={product.price}
          image={primaryImage}
          slug={product.slug}
        />
      </div>
    </div>
  );
}
