"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { PageHero } from "@/components/common/PageHero";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center p-8 bg-white shadow-sm border border-gray-100 max-w-md mx-4">
          <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-medium mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/shop">
            <Button variant="default" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pb-12">
      <PageHero title="Shopping Cart" alignment="center" />

      <div className="container-width">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Header Row - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
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
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
              <Link
                href="/shop"
                className="text-sm font-medium text-muted-foreground hover:text-black transition-colors flex items-center gap-2"
              >
                ← Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-xs uppercase tracking-[0.1em] text-red-500 hover:text-red-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary total={getTotal()} />
          </div>
        </div>
      </div>
    </div>
  );
}
