"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import AddToCartButton from "./AddToCartButton";

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [activeImage, setActiveImage] = useState(product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url);

  const sizes = useMemo(() => [...new Set(product.variants.map((v) => v.size).filter(Boolean))], [product.variants]);
  const colors = useMemo(() => [...new Set(product.variants.map((v) => v.color).filter(Boolean))], [product.variants]);

  const currentVariant = useMemo(() => {
    return product.variants.find((v) => {
      const sizeMatch = sizes.length > 0 ? v.size === selectedSize : true;
      const colorMatch = colors.length > 0 ? v.color === selectedColor : true;
      return sizeMatch && colorMatch;
    });
  }, [product.variants, sizes, colors, selectedSize, selectedColor]);

  const currentPrice = currentVariant ? currentVariant.price : product.price;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > currentPrice;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Image Section */}
            <div className="space-y-3">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                {activeImage ? (
                  <Image src={activeImage} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.slice(0, 5).map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.url)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                        activeImage === img.url ? "border-accent" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image src={img.url} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {product.category && (
                <span className="text-xs text-accent font-medium uppercase tracking-wider">{product.category.name}</span>
              )}

              <h2 className="text-2xl font-bold text-primary">{product.name}</h2>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">₦{currentPrice.toLocaleString()}</span>
                {hasDiscount && <span className="text-gray-400 line-through">₦{product.compareAtPrice!.toLocaleString()}</span>}
              </div>

              <p className="text-gray-600 text-sm line-clamp-3">{product.description}</p>

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                          selectedSize === size ? "border-primary bg-primary text-white" : "border-gray-300 hover:border-primary"
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
                  <h4 className="text-sm font-medium mb-2">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                          selectedColor === color
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 hover:border-primary"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Indicator */}
              {currentVariant && (
                <div className="text-sm">
                  {currentVariant.stock === 0 ? (
                    <span className="text-error font-medium">Out of Stock</span>
                  ) : currentVariant.stock <= 5 ? (
                    <span className="text-warning font-medium animate-pulse">Only {currentVariant.stock} left!</span>
                  ) : (
                    <span className="text-success font-medium">In Stock</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <AddToCartButton
                  product={product}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  disabled={!currentVariant || currentVariant.stock === 0}
                  onSuccess={onClose}
                />
              </div>

              {/* View Full Details */}
              <Link
                href={`/product/${product.slug}`}
                className="block text-center text-sm text-accent hover:underline"
                onClick={onClose}
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
