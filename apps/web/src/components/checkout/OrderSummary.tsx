import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface OrderItem {
  variantId: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  onApplyPromo: () => void;
  isSubmitting: boolean;
  hasShippingZone: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  discount,
  shipping,
  total,
  promoCode,
  setPromoCode,
  onApplyPromo,
  isSubmitting,
  hasShippingZone,
}: OrderSummaryProps) {
  return (
    <div className="bg-white p-8 sticky top-24 border border-gray-100 shadow-sm">
      <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-6">Order Summary</h2>

      {/* Items Preview */}
      <div className="space-y-3 mb-6 max-h-68 overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div key={item.variantId} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-600 truncate max-w-[65%]">
              {item.name} × {item.quantity}
            </span>
            <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Promo Code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-black transition-colors bg-white"
        />
        <Button type="button" variant="outline" size="sm" onClick={onApplyPromo} className="text-xs">
          Apply
        </Button>
      </div>

      <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-₦{discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Shipping</span>
          <span className={shipping === 0 && !hasShippingZone ? "text-amber-500 italic" : ""}>
            {shipping === 0 ? "Calculated at next step" : `₦${shipping.toLocaleString()}`}
          </span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
      </div>

      <Button type="submit" variant="default" size="lg" className="w-full mt-8" disabled={isSubmitting} form="checkout-form">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Place Order"
        )}
      </Button>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-100 opacity-80">
        <TrustBadge icon="shield" text="Secure Checkout" />
        <TrustBadge icon="star" text="Quality Guarantee" />
        <TrustBadge icon="undo" text="Easy Returns" />
        <TrustBadge icon="truck" text="Fast Shipping" />
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-4">By placing this order, you agree to our Terms of Service.</p>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  // Simple placeholders for icons
  return (
    <div className="flex items-center gap-2 text-[10px] text-gray-600">
      <div className="w-1 h-1 bg-green-500 rounded-full" /> {/* Placeholder dot */}
      <span>{text}</span>
    </div>
  );
}
