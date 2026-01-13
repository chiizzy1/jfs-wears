import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchProductBySlug } from "@/lib/api";
import ProductDetails from "@/components/storefront/ProductDetails";
import ProductReviews from "@/components/storefront/ProductReviews";
import RecentlyViewedTracker from "@/components/storefront/RecentlyViewedTracker";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || "";

  return (
    <div className="min-h-screen bg-secondary pt-24 pb-8">
      <div className="container-width">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-primary">
            Shop
          </Link>
          {product.category && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-primary">
                {product.category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-primary">{product.name}</span>
        </nav>

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
