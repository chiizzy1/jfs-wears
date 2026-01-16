"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/api";
import { ProductPrice } from "./ProductPrice";

interface RelatedProductsProps {
  products: Product[];
}

/**
 * Related Products Component
 *
 * Displays a grid of related products for cross-selling.
 * Sharp-edge design, no rounded corners.
 */
export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null; // Don't render if no related products
  }

  return (
    <section className="py-16 border-t border-gray-100">
      <div className="container-width">
        {/* Section Header */}
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">You May Also Like</p>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight">Related Products</h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => {
            const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

            return (
              <Link key={product.id} href={`/product/${product.slug}`} className="group block">
                {/* Image Container - Sharp edges */}
                <div className="relative aspect-3/4 overflow-hidden bg-secondary mb-4">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.alt || product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  {product.category && <p className="text-xs uppercase tracking-widest text-gray-500">{product.category.name}</p>}
                  <h3 className="text-sm font-medium text-primary line-clamp-2 group-hover:underline underline-offset-4 transition-all">
                    {product.name}
                  </h3>
                  <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
