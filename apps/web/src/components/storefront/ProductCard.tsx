"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api";
import QuickViewModal from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
}

/**
 * Premium Product Card
 *
 * Mason Garments-inspired: No shadows, no rounded corners, clean typography
 */
export default function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  // Calculate total stock across all variants
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isLowStock = totalStock > 0 && totalStock <= 5;
  const isOutOfStock = totalStock === 0;

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <Link href={`/product/${product.slug}`} className="group block">
        {/* Image Container - No rounded corners, no shadows */}
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
          )}

          {/* Minimal Badges - Text only, subtle */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {hasDiscount && (
              <span className="text-xs uppercase tracking-[0.1em] text-sale font-medium">Save {discountPercent}%</span>
            )}
            {isLowStock && <span className="text-xs uppercase tracking-[0.1em] text-muted">Low Stock</span>}
            {isOutOfStock && <span className="text-xs uppercase tracking-[0.1em] text-muted">Sold Out</span>}
          </div>

          {/* Quick View - Appears on hover, minimal style */}
          <div
            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
            onClick={handleQuickView}
          >
            <span className="bg-white text-primary px-6 py-3 text-xs uppercase tracking-[0.15em] font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-black hover:text-white">
              Quick View
            </span>
          </div>
        </div>

        {/* Product Info - Clean typography */}
        <div className="space-y-2">
          {/* Category */}
          {product.category && <p className="text-xs uppercase tracking-[0.1em] text-muted">{product.category.name}</p>}

          {/* Product Name - Simple hover underline */}
          <h3 className="text-sm font-medium text-primary line-clamp-2 group-hover:underline underline-offset-4 transition-all">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">₦{product.price.toLocaleString()}</span>
            {hasDiscount && <span className="text-sm text-muted line-through">₦{product.compareAtPrice!.toLocaleString()}</span>}
          </div>
        </div>
      </Link>

      {/* Quick View Modal */}
      <QuickViewModal product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
    </>
  );
}
