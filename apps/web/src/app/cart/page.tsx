"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore, CartItem } from "@/lib/store";
import { Button } from "@/components/ui/Button";

/**
 * Premium Cart Page
 *
 * Mason Garments-inspired: Clean table layout, no rounded corners, minimal design
 */
export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-20 h-20 mx-auto mb-6 text-gray-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={0.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-2xl font-medium mb-2">Your cart is empty</h1>
          <p className="text-muted mb-8">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/shop">
            <Button variant="primary" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-12">
      <div className="container-width">
        <h1 className="text-3xl font-medium tracking-[0.02em] mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Header Row - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-xs uppercase tracking-[0.15em] text-muted">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <CartItemRow
                  key={item.variantId}
                  item={item}
                  onRemove={() => removeItem(item.variantId)}
                  onUpdateQuantity={(qty) => updateQuantity(item.variantId, qty)}
                />
              ))}
            </div>

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="mt-6 text-xs uppercase tracking-[0.1em] text-muted hover:text-primary transition-colors underline underline-offset-4"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 sticky top-24 border border-gray-100">
              <h2 className="text-sm uppercase tracking-[0.2em] font-medium mb-6">Order Summary</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span>₦{getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span className="text-muted">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>₦{getTotal().toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-8">
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link
                href="/shop"
                className="block mt-4 text-center text-xs uppercase tracking-[0.1em] text-muted hover:text-primary transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Cart Item Row Component
 */
function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6">
      {/* Product Info */}
      <div className="col-span-1 md:col-span-6 flex gap-4">
        <div className="relative w-24 h-28 bg-secondary shrink-0">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-xs">No image</div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-muted mt-1">
            {item.size && <span>Size: {item.size}</span>}
            {item.size && item.color && <span className="mx-2">•</span>}
            {item.color && <span>Color: {item.color}</span>}
          </p>
          <button
            onClick={onRemove}
            className="mt-2 text-xs text-muted hover:text-primary transition-colors underline underline-offset-4 text-left"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
        <div className="flex items-center border border-gray-200">
          <button
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            −
          </button>
          <span className="w-10 h-10 flex items-center justify-center text-sm">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-end">
        <span className="md:hidden text-sm text-muted mr-2">Price:</span>
        <span className="text-sm">₦{item.price.toLocaleString()}</span>
      </div>

      {/* Total */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-end">
        <span className="md:hidden text-sm text-muted mr-2">Total:</span>
        <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
      </div>
    </div>
  );
}
