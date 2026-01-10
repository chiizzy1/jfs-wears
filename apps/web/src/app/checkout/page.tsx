"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ShippingZone {
  id: string;
  name: string;
  states: string[];
  fee: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  paymentMethod: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    paymentMethod: "card",
  });

  const subtotal = getTotal();
  const shipping = selectedZone?.fee || 0;
  const total = subtotal - discount + shipping;

  // Prefill form for logged-in users
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = (user.name || "").split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [isAuthenticated, user]);

  // Fetch shipping zones on mount
  useEffect(() => {
    async function fetchShippingZones() {
      try {
        const res = await fetch(`${API_BASE_URL}/shipping/zones`);
        if (res.ok) {
          const zones: ShippingZone[] = await res.json();
          setShippingZones(zones);
        }
      } catch (error) {
        console.error("Failed to fetch shipping zones:", error);
      }
    }
    fetchShippingZones();
  }, []);

  // Update shipping when state changes
  useEffect(() => {
    if (formData.state) {
      const zone = shippingZones.find((z) => z.states.includes(formData.state));
      setSelectedZone(zone || null);
    }
  }, [formData.state, shippingZones]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/promotions/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, orderAmount: subtotal }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Invalid promo code");
      }

      const data = await res.json();
      setDiscount(data.discount);
      toast.success(data.message);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to apply promo code";
      toast.error(message);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedZone) {
      toast.error("Please select a valid state for shipping");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the order
      const orderPayload = {
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingZoneId: selectedZone.id,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state}`,
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        promoCode: promoCode || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create order");
      }

      const order = await res.json();

      // If payment method is card, redirect to payment
      if (formData.paymentMethod === "card") {
        // Initialize payment
        const paymentRes = await fetch(`${API_BASE_URL}/payments/initialize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            amount: total,
            email: formData.email,
            provider: "PAYSTACK",
          }),
        });

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          // Redirect to payment gateway
          if (paymentData.authorizationUrl) {
            clearCart();
            window.location.href = paymentData.authorizationUrl;
            return;
          }
        }
      }

      // For bank transfer or COD, just show success
      toast.success(`Order #${order.orderNumber || order.id.slice(0, 8)} placed successfully!`);
      clearCart();
      router.push(`/shop`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to place order";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-2 tracking-[0.02em]">No items in cart</h1>
          <p className="text-muted mb-8">Add some products first.</p>
          <Link href="/shop">
            <Button variant="primary">Go to Shop</Button>
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

        <form onSubmit={handleCheckout}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white p-8 border border-gray-100">
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted font-medium mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 bg-transparent focus:outline-none focus:border-black transition-colors text-sm"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-8 border border-gray-100">
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted font-medium mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                    />
                    <select
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent bg-white"
                    >
                      <option value="">Select State</option>
                      {availableStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedZone && (
                    <p className="text-sm text-gray-500">
                      Shipping to {selectedZone.name}: ₦{selectedZone.fee.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-8 border border-gray-100">
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted font-medium mb-6">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 cursor-pointer hover:border-black transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={handleInputChange}
                      className="accent-accent"
                    />
                    <span>Card Payment (Paystack)</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-accent transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      onChange={handleInputChange}
                      className="accent-accent"
                    />
                    <span>Bank Transfer</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-accent transition-colors">
                    <input type="radio" name="paymentMethod" value="cod" onChange={handleInputChange} className="accent-accent" />
                    <span>Cash on Delivery (Lagos Only)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 sticky top-24 border border-gray-100">
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted font-medium mb-6">Order Summary</h2>

                {/* Items Preview */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate max-w-[60%]">
                        {item.name} × {item.quantity}
                      </span>
                      <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleApplyPromo}>
                    Apply
                  </Button>
                </div>

                <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-₦{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span>{shipping === 0 ? "Select state" : `₦${shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-8"
                  disabled={isSubmitting || !selectedZone}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>Quality Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Easy Returns</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Fast Shipping</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  By placing this order, you agree to our Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
