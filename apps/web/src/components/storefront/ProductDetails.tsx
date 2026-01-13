"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ColorGroup } from "@/lib/api";
import { Button } from "@/components/ui/button";
import AddToCartButton from "./AddToCartButton";
import SizeGuideModal from "./SizeGuideModal";
import { useWishlistStore } from "@/stores/wishlist-store";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Truck, ShieldCheck } from "lucide-react";

interface ProductDetailsProps {
  product: Product;
}

/**
 * Premium Product Details with Color-Based Image Switching
 *
 * Features fluid transitions when switching colors
 */
export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Get unique sizes and colors from variants
  const sizes = useMemo(
    () => [...new Set(product.variants.map((v) => v.size).filter((s): s is string => !!s))],
    [product.variants]
  );
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color).filter((c): c is string => !!c))],
    [product.variants]
  );

  // Get color groups for color-based image switching
  const colorGroups = useMemo(() => {
    // Use colorGroups if available, otherwise fall back to empty
    return product.colorGroups || [];
  }, [product.colorGroups]);

  // Get current images based on selected color
  const currentImages = useMemo(() => {
    if (selectedColor && colorGroups.length > 0) {
      const colorGroup = colorGroups.find((cg) => cg.colorName.toLowerCase() === selectedColor.toLowerCase());
      if (colorGroup && colorGroup.images.length > 0) {
        return colorGroup.images.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          isPrimary: img.isMain,
        }));
      }
    }
    // Fall back to product.images if no color-specific images
    return product.images;
  }, [selectedColor, colorGroups, product.images]);

  // Common color name to hex mapping for fallback
  const colorNameToHex: Record<string, string> = {
    black: "#000000",
    white: "#ffffff",
    red: "#dc2626",
    blue: "#2563eb",
    navy: "#1e3a5a",
    "navy blue": "#1e3a5a",
    green: "#16a34a",
    yellow: "#eab308",
    orange: "#ea580c",
    purple: "#9333ea",
    pink: "#ec4899",
    brown: "#78350f",
    gray: "#6b7280",
    grey: "#6b7280",
    beige: "#d4c4a8",
    cream: "#f5f5dc",
    olive: "#556b2f",
    maroon: "#800000",
    burgundy: "#800020",
    teal: "#0d9488",
    turquoise: "#40e0d0",
    gold: "#d4af37",
    silver: "#c0c0c0",
    charcoal: "#36454f",
    khaki: "#c3b091",
    tan: "#d2b48c",
    coral: "#ff7f50",
    salmon: "#fa8072",
    lavender: "#e6e6fa",
    mint: "#98fb98",
    peach: "#ffcba4",
    rust: "#b7410e",
    ivory: "#fffff0",
    sand: "#c2b280",
    wine: "#722f37",
    forest: "#228b22",
    "forest green": "#228b22",
    camel: "#c19a6b",
    chocolate: "#7b3f00",
    coffee: "#6f4e37",
    denim: "#1560bd",
    stone: "#928e85",
    oatmeal: "#d8cab8",
    ash: "#b2beb5",
  };

  // Get color hex for swatches with fallback
  const getColorHex = useCallback(
    (colorName: string) => {
      // First try to get from colorGroups
      const colorGroup = colorGroups.find((cg) => cg.colorName.toLowerCase() === colorName.toLowerCase());
      if (colorGroup?.colorHex) {
        return colorGroup.colorHex;
      }
      // Fallback to color name mapping
      return colorNameToHex[colorName.toLowerCase()] || "#cccccc";
    },
    [colorGroups]
  );

  // Active image URL
  const activeImage = currentImages[activeImageIndex]?.url || currentImages[0]?.url;

  // Set defaults if only one option exists
  useEffect(() => {
    if (sizes.length === 1) setSelectedSize(sizes[0]);
    if (colors.length === 1) setSelectedColor(colors[0]);
    if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
  }, [sizes, colors, selectedColor]);

  // Handle color change with smooth transition
  const handleColorChange = useCallback(
    (color: string) => {
      if (color === selectedColor) return;

      setIsTransitioning(true);

      // Fade out, change color, fade in
      setTimeout(() => {
        setSelectedColor(color);
        setActiveImageIndex(0); // Reset to first image of new color

        setTimeout(() => {
          setIsTransitioning(false);
        }, 150);
      }, 150);
    },
    [selectedColor]
  );

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
      {/* Image Gallery with Smooth Transitions */}
      <div className="space-y-4">
        <div className="relative aspect-square bg-secondary overflow-hidden">
          {activeImage ? (
            <div
              className={cn(
                "relative w-full h-full transition-all duration-300 ease-out",
                isTransitioning ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100"
              )}
            >
              <Image src={activeImage} alt={product.name} fill className="object-cover" priority />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
          )}
          {/* Minimal sale badge */}
          {hasDiscount && (
            <span className="absolute top-4 left-4 text-xs uppercase tracking-widest text-sale font-medium">Sale</span>
          )}
        </div>

        {/* Thumbnail Gallery - Smooth selection */}
        {currentImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {currentImages.map((img, index) => (
              <button
                key={img.id}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setActiveImageIndex(index);
                    setTimeout(() => setIsTransitioning(false), 150);
                  }, 150);
                }}
                className={cn(
                  "relative w-20 h-20 overflow-hidden shrink-0 border-2 transition-all duration-200",
                  activeImageIndex === index
                    ? "border-black scale-105"
                    : "border-transparent hover:border-gray-300 hover:scale-105"
                )}
              >
                <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-8">
        {/* Category */}
        {product.category && (
          <Link
            href={`/shop?category=${product.category.slug}`}
            className="text-xs uppercase tracking-[0.15em] text-black hover:text-gray-600 transition-colors"
          >
            {product.category.name}
          </Link>
        )}

        {/* Product Name */}
        <h1 className="text-3xl md:text-4xl font-medium text-primary tracking-[0.02em]">{product.name}</h1>

        {/* Price */}
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-4">
            <span className="text-2xl font-medium">₦{currentPrice.toLocaleString()}</span>
            {hasDiscount && <span className="text-lg text-muted line-through">₦{product.compareAtPrice!.toLocaleString()}</span>}
          </div>

          {/* Bulk Pricing Tiers - High Hierarchy White Card */}
          {product.bulkEnabled && product.bulkPricingTiers && product.bulkPricingTiers.length > 0 && (
            <div className="bg-white text-black p-8 w-full my-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-black">Bulk Savings</h4>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 font-bold uppercase tracking-wider">
                  Volume Discount
                </span>
              </div>
              <div className="space-y-4">
                {product.bulkPricingTiers.map((tier) => (
                  <div key={tier.minQuantity} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Buy {tier.minQuantity}+ pieces</span>
                    <span className="font-bold text-black text-lg">{Number(tier.discountPercent)}% OFF</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-black leading-relaxed">{product.description}</p>

        {/* Color Selector - Visual Swatches with Smooth Transitions */}
        {colors.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-black">Color</h3>
              {selectedColor && <span className="text-xs text-black capitalize">{selectedColor}</span>}
            </div>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => {
                const hexColor = getColorHex(color);
                const isSelected = selectedColor === color;

                return (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    title={color}
                    className={cn(
                      "relative w-10 h-10 rounded-full border-2 transition-all duration-200 ease-out",
                      isSelected
                        ? "border-black scale-110 ring-2 ring-black ring-offset-2"
                        : "border-gray-300 hover:border-gray-500 hover:scale-105"
                    )}
                    style={{
                      backgroundColor: hexColor || "#cccccc",
                    }}
                  >
                    {/* Checkmark for selected */}
                    {isSelected && (
                      <span
                        className={cn(
                          "absolute inset-0 flex items-center justify-center",
                          hexColor && isLightColor(hexColor) ? "text-black" : "text-white"
                        )}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size Selector */}
        {sizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-black">Size</h3>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-xs uppercase tracking-widest text-black hover:text-gray-600 transition-colors underline underline-offset-4"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "min-w-[48px] h-12 px-4 border text-sm font-medium transition-all duration-200",
                    selectedSize === size ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock Status */}
        {currentVariant && (
          <div>
            {currentVariant.stock === 0 ? (
              <span className="text-xs uppercase tracking-widest text-sale">Out of Stock</span>
            ) : currentVariant.stock <= 5 ? (
              <span className="text-xs uppercase tracking-widest text-black">Only {currentVariant.stock} left</span>
            ) : (
              <span className="text-xs uppercase tracking-widest text-black">In Stock</span>
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

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 gap-6 pt-12 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-black" strokeWidth={1} />
            <span className="text-xs text-black uppercase tracking-wider font-medium">Free shipping over ₦30k</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-black" strokeWidth={1} />
            <span className="text-xs text-black uppercase tracking-wider font-medium">Quality guaranteed</span>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}

// Helper to determine if a color is light (for checkmark visibility)
function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 186;
}

// WishlistButton Component
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
        className={cn("w-5 h-5 transition-colors", inWishlist && "fill-black text-black")}
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
