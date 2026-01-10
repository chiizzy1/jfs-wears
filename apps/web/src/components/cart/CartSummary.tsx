import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CartSummaryProps {
  total: number;
}

export function CartSummary({ total }: CartSummaryProps) {
  return (
    <div className="bg-white p-8 sticky top-24 border border-gray-100 shadow-sm">
      <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 text-muted-foreground">Order Summary</h2>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground italic">Calculated at checkout</span>
        </div>
        <div className="border-t border-gray-100 pt-4 flex justify-between font-medium text-lg">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
      </div>

      <Link href="/checkout" className="block mt-8">
        <Button variant="default" size="lg" className="w-full">
          Proceed to Checkout
        </Button>
      </Link>

      <Link
        href="/shop"
        className="block mt-4 text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-black transition-colors"
      >
        Continue Shopping
      </Link>

      <div className="mt-8 pt-6 border-t border-gray-100 text-[10px] text-gray-400 text-center uppercase tracking-wide">
        Secure Checkout • Fast Shipping • Easy Returns
      </div>
    </div>
  );
}
