"use client";

import { Button } from "@/components/ui/button";
import { Product } from "@/lib/api";
import { useCartStore, CartState } from "@/stores/cart-store";
import { useCartDrawerStore, CartDrawerState } from "@/stores/cart-drawer-store";
import toast from "react-hot-toast";

interface AddToCartButtonProps {
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

/**
 * Premium Add to Cart Button
 *
 * Opens the cart drawer on successful add
 */
export default function AddToCartButton({ product, selectedSize, selectedColor, disabled, onSuccess }: AddToCartButtonProps) {
  const addItem = useCartStore((state: CartState) => state.addItem);
  const openDrawer = useCartDrawerStore((state: CartDrawerState) => state.openDrawer);

  const handleAddToCart = () => {
    // Find the specific variant based on selection
    const variant = product.variants.find((v) => {
      const sizeMatch = !v.size || v.size === selectedSize;
      const colorMatch = !v.color || v.color === selectedColor;
      return sizeMatch && colorMatch;
    });

    if (!variant) {
      toast.error("Please select options");
      return;
    }

    if (variant.stock === 0) {
      toast.error("This item is out of stock");
      return;
    }

    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: variant.price || product.price,
      size: variant.size,
      color: variant.color,
      image: product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || "",
      quantity: 1,
      bulkPricingTiers: product.bulkPricingTiers,
    });

    // Open cart drawer instead of just showing toast
    openDrawer();
    onSuccess?.();
  };

  return (
    <Button variant="secondary" size="lg" className="flex-1" onClick={handleAddToCart} disabled={disabled}>
      {disabled ? "Select Options" : "Add to Cart"}
    </Button>
  );
}
