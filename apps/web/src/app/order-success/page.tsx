"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";

/**
 * Premium Order Success Page
 */
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const clearCart = useCartStore((state) => state.clearCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    clearCart();
  }, [clearCart]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-secondary py-12">
      <div className="container-width max-w-2xl">
        <div className="bg-white p-10 md:p-16 text-center border border-gray-100">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-medium text-primary mb-2 tracking-[0.02em]">Order Confirmed</h1>
          <p className="text-muted text-sm mb-8">Thank you for shopping with JFS Wears</p>

          {/* Order Number */}
          {orderNumber && (
            <div className="bg-secondary p-6 mb-8">
              <p className="text-xs uppercase tracking-[0.15em] text-muted mb-2">Order Number</p>
              <p className="text-xl font-medium font-mono">{orderNumber}</p>
            </div>
          )}

          {/* What Happens Next */}
          <div className="text-left bg-secondary p-6 mb-10">
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-6">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs shrink-0">1</div>
                <p className="text-sm text-muted pt-1">We'll send you an order confirmation email shortly</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs shrink-0">2</div>
                <p className="text-sm text-muted pt-1">Our team will prepare your items for shipping</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs shrink-0">3</div>
                <p className="text-sm text-muted pt-1">You'll receive tracking info when your order ships</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderNumber && (
              <Link href={`/track?order=${orderNumber}`}>
                <Button variant="outline">Track Order</Button>
              </Link>
            )}
            <Link href="/shop">
              <Button variant="primary">Continue Shopping</Button>
            </Link>
          </div>

          {/* Trust Message */}
          <p className="text-xs text-muted mt-10">Questions? Contact us at support@jfswears.com</p>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-secondary flex items-center justify-center">
          <div className="text-muted text-sm">Loading...</div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
