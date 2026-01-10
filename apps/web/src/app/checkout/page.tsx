"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutValues } from "@/schemas/checkout.schema";
import { useCheckout } from "@/hooks/use-checkout";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    discount,
    shipping,
    total,
    shippingZones,
    selectedZone,
    promoCode,
    setPromoCode,
    handleStateChange,
    applyPromoCode,
    processOrder,
    isSubmitting,
    isAuthenticated,
    user,
  } = useCheckout();

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      paymentMethod: "card",
    },
  });

  // Prefill form for logged-in users
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = (user.name || "").split(" ");
      form.reset({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        address: "",
        city: "",
        state: "",
        paymentMethod: "card",
      });
    }
  }, [isAuthenticated, user, form]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-2 tracking-[0.02em]">No items in cart</h1>
          <p className="text-muted-foreground mb-8">Add some products first.</p>
          <Link href="/shop">
            <Button variant="default">Go to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get unique states from all shipping zones
  const availableStates = Array.from(new Set(shippingZones.flatMap((z) => z.states))).sort();

  return (
    <div className="min-h-screen bg-secondary py-12">
      <div className="container-width">
        <h1 className="text-3xl font-medium mb-10 tracking-[0.02em]">Checkout</h1>

        <Form {...form}>
          <form id="checkout-form" onSubmit={form.handleSubmit(processOrder)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                <CheckoutForm
                  form={form}
                  availableStates={availableStates}
                  handleStateChange={handleStateChange}
                  selectedZoneName={selectedZone?.name}
                  shippingFee={selectedZone?.fee || 0}
                />
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  discount={discount}
                  shipping={shipping}
                  total={total}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  onApplyPromo={applyPromoCode}
                  isSubmitting={isSubmitting}
                  hasShippingZone={!!selectedZone}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
