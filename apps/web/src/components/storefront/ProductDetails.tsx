"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import AddToCartButton from "./AddToCartButton";
import SizeGuideModal from "./SizeGuideModal";
import { useWishlistStore } from "@/lib/wishlist-store";
import toast from "react-hot-toast";

interface ProductDetailsProps {
  product: Product;
}

/**
 * Premium Product Details
 *
 * Mason Garments-inspired: Split layout, clean size selector, minimal badges
 */
export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [activeImage, setActiveImage] = useState(product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Get unique sizes and colors
  const sizes = useMemo(() => [...new Set(product.variants.map((v) => v.size).filter(Boolean))], [product.variants]);
  const colors = useMemo(() => [...new Set(product.variants.map((v) => v.color).filter(Boolean))], [product.variants]);

  // Set defaults if only one option exists
  useEffect(() => {
    if (sizes.length === 1) setSelectedSize(sizes[0]);
    if (colors.length === 1) setSelectedColor(colors[0]);
  }, [sizes, colors]);

  const currentVariant = useMemo(() => {
    return product.variants.find((v) => {
      const sizeMatch = sizes.length > 0 ? v.size === selectedSize : true;
      const colorMatch = colors.length > 0 ? v.color === selectedColor : true;
      return sizeMatch && colorMatch;
    });
  }, [product.variants, sizes, colors, selectedSize, selectedColor]);

  const currentPrice = currentVariant ? currentVariant.price : product.price;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > currentPrice;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      {/* Image Gallery - No rounded corners */}
      <div className="space-y-4">
        <div className="relative aspect-square bg-secondary overflow-hidden">
          {activeImage ? (
            <Image src={activeImage} alt={product.name} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
          )}
          {/* Minimal sale badge */}
          {hasDiscount && (
            <span className="absolute top-4 left-4 text-xs uppercase tracking-[0.1em] text-sale font-medium">Sale</span>
          )}
        </div>

        {/* Thumbnail Gallery - Clean squares */}
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.url)}
                className={`relative w-20 h-20 overflow-hidden shrink-0 border ${
                  activeImage === img.url ? "border-black" : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info - Clean typography */}
      <div className="space-y-8">
        {/* Category */}
        {product.category && (
          <Link
            href={`/shop?category=${product.category.slug}`}
            className="text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors"
          >
            {product.category.name}
          </Link>
        )}

        {/* Product Name */}
        <h1 className="text-3xl md:text-4xl font-medium text-primary tracking-[0.02em]">{product.name}</h1>

        {/* Price */}
        <div className="flex items-baseline gap-4">
          <span className="text-2xl font-medium">₦{currentPrice.toLocaleString()}</span>
          {hasDiscount && <span className="text-lg text-muted line-through">₦{product.compareAtPrice!.toLocaleString()}</span>}
        </div>

        {/* Description */}
        <p className="text-muted leading-relaxed">{product.description}</p>

        {/* Size Selector - Clean grid */}
        {sizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-[0.15em] font-medium">Size</h3>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-xs uppercase tracking-[0.1em] text-muted hover:text-primary transition-colors underline underline-offset-4"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] h-12 px-4 border text-sm font-medium transition-colors ${
                    selectedSize === size ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selector */}
        {colors.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">Color</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 h-12 border text-sm font-medium transition-colors ${
                    selectedColor === color ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock Status - Minimal */}
        {currentVariant && (
          <div>
            {currentVariant.stock === 0 ? (
              <span className="text-xs uppercase tracking-[0.1em] text-sale">Out of Stock</span>
            ) : currentVariant.stock <= 5 ? (
              <span className="text-xs uppercase tracking-[0.1em] text-muted">Only {currentVariant.stock} left</span>
            ) : (
              <span className="text-xs uppercase tracking-[0.1em] text-muted">In Stock</span>
            )}
          </div>
        )}

        {/* Add to Cart & Wishlist */}
        <div className="flex gap-4 pt-4">
          <AddToCartButton
            product={product}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            disabled={!currentVariant || currentVariant.stock === 0}
          />
          <WishlistButton product={product} />
        </div>

        {/* Trust Indicators - Minimal */}
        <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs text-muted">Free shipping over ₦30,000</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-muted">Quality guaranteed</span>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}

// WishlistButton Component - Premium style
function WishlistButton({ product }: { product: Product }) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || "";

  const handleToggle = () => {
    if (inWishlist) {
      removeItem(product.id);
      toast.success("Removed from wishlist");
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: primaryImage,
        slug: product.slug,
      });
      toast.success("Added to wishlist");
    }
  };

  return (
    <Button variant="outline" size="lg" onClick={handleToggle} className="px-6">
      <svg
        className={`w-5 h-5 transition-colors ${inWishlist ? "fill-black text-black" : ""}`}
        fill={inWishlist ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </Button>
  );
}
