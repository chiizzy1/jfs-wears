"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api";
import QuickViewModal from "./QuickViewModal";
import { SaleBadge } from "./SaleBadge";
import { CountdownTimer } from "./CountdownTimer";
import { ProductPrice } from "./ProductPrice";

interface ProductCardProps {
  product: Product;
  className?: string;
}

/**
 * Premium Product Card
 *
 * Mason Garments-inspired: No shadows, no rounded corners, clean typography
 */
function ProductCardComponent({ product, className = "" }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

  // Calculate discount percentage based on price difference if on sale
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const isSaleActive = !!product.saleEndDate && new Date(product.saleEndDate) > new Date();

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
      <Link href={`/product/${product.slug}`} className={`group block ${className}`}>
        {/* Image Container - No rounded corners, no shadows */}
        <div className="relative aspect-3/4 overflow-hidden bg-secondary mb-4">
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

          {/* Minimal Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {hasDiscount && <SaleBadge price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />}
            {isLowStock && <span className="text-xs uppercase tracking-widest text-muted">Low Stock</span>}
            {isOutOfStock && <span className="text-xs uppercase tracking-widest text-muted">Sold Out</span>}
          </div>

          {/* Sale Timer Overlay - Only if sale is active and ending soon (optional logic, but here acts as visual urgency) */}
          {isSaleActive && product.saleEndDate && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1 flex justify-center">
              <CountdownTimer endDate={product.saleEndDate} size="sm" className="text-white text-xs" />
            </div>
          )}

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
          {product.category && <p className="text-xs uppercase tracking-widest text-gray-500">{product.category.name}</p>}

          {/* Product Name - Simple hover underline */}
          <h3 className="text-sm font-medium text-primary line-clamp-2 group-hover:underline underline-offset-4 transition-all">
            {product.name}
          </h3>

          {/* Price */}
          <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
        </div>
      </Link>

      {/* Quick View Modal */}
      <QuickViewModal product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
    </>
  );
}

/**
 * Memoized ProductCard for performance in grid views
 * Only re-renders when product prop changes
 */
const ProductCard = React.memo(ProductCardComponent);
export default ProductCard;
