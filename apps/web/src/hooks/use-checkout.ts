import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import toast from "react-hot-toast";
import { CheckoutValues } from "@/schemas/checkout.schema";
import { apiClient, getErrorMessage } from "@/lib/api-client";

export interface ShippingZone {
  id: string;
  name: string;
  states: string[];
  fee: number;
}

interface OrderResponse {
  id: string;
  orderNumber: string;
  total: number;
}

interface PaymentResponse {
  authorizationUrl?: string;
  paymentUrl?: string;
  reference?: string;
}

interface PromotionValidation {
  discount: number;
  message: string;
}

export function useCheckout() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);

  const subtotal = getTotal();
  const shipping = selectedZone?.fee || 0;
  const total = Math.max(0, subtotal - discount + shipping);

  // Fetch shipping zones
  useEffect(() => {
    async function fetchShippingZones() {
      try {
        const zones = await apiClient.get<ShippingZone[]>("/shipping/zones");
        setShippingZones(zones);
      } catch (error) {
        console.error("Failed to fetch shipping zones:", error);
        // Don't show toast for this - zones might not be configured
      }
    }
    fetchShippingZones();
  }, []);

  const handleStateChange = (stateName: string) => {
    const zone = shippingZones.find((z) => z.states.includes(stateName));
    setSelectedZone(zone || null);
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      const data = await apiClient.post<PromotionValidation>("/promotions/validate", {
        code: promoCode,
        orderAmount: subtotal,
      });
      setDiscount(data.discount);
      toast.success(data.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDiscount(0);
    }
  };

  const processOrder = async (data: CheckoutValues) => {
    if (!selectedZone) {
      toast.error("Please select a valid state for shipping");
      throw new Error("Invalid shipping zone");
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      throw new Error("Empty cart");
    }

    setIsSubmitting(true);

    try {
      // Create order payload
      const orderPayload = {
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingZoneId: selectedZone.id,
        shippingAddress: `${data.address}, ${data.city}, ${data.state}`,
        customerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
        promoCode: promoCode || undefined,
        paymentMethod: data.paymentMethod,
      };

      const order = await apiClient.post<OrderResponse>("/orders", orderPayload);

      // Handle Payment Redirects (Card / OPay / Monnify)
      if (["card", "opay", "monnify"].includes(data.paymentMethod)) {
        try {
          let provider: "PAYSTACK" | "OPAY" | "MONNIFY" = "PAYSTACK";
          if (data.paymentMethod === "opay") provider = "OPAY";
          if (data.paymentMethod === "monnify") provider = "MONNIFY";

          const paymentData = await apiClient.post<PaymentResponse>("/payments/initialize", {
            orderId: order.id,
            amount: total,
            email: data.email,
            provider,
          });

          if (paymentData.authorizationUrl || paymentData.paymentUrl) {
            clearCart();
            window.location.href = paymentData.authorizationUrl || paymentData.paymentUrl || "";
            return;
          }
        } catch (paymentError) {
          console.error("Payment initialization failed:", paymentError);
          // Continue to COD fallback or show error
          toast.error("Payment initialization failed. Please try again or choose another payment method.");
          throw paymentError;
        }
      }

      // Default Success (COD / Transfer)
      toast.success(`Order #${order.orderNumber || order.id.slice(0, 8)} placed successfully!`);
      clearCart();
      router.push(`/order-success?id=${order.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
