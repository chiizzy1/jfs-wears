"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiClient, getErrorMessage, isApiError } from "@/lib/api-client";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface OrderItem {
  id: string;
  productName: string;
  variantSize?: string;
  variantColor?: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
  };
  items: OrderItem[];
}

const statusSteps = [
  { key: "PENDING", label: "Order Placed", icon: "📦" },
  { key: "CONFIRMED", label: "Confirmed", icon: "✅" },
  { key: "PROCESSING", label: "Processing", icon: "⚙️" },
  { key: "SHIPPED", label: "Shipped", icon: "🚚" },
  { key: "DELIVERED", label: "Delivered", icon: "🎉" },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order");
  const [orderNumber, setOrderNumber] = useState(orderParam || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const fetchOrder = useCallback(async (num: string) => {
    if (!num.trim()) return;

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const data = await apiClient.get<Order>(`/orders/track/${num}`);
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);

      if (isApiError(err) && err.isNotFound) {
        setIsNotFound(true);
        setError("Order not found. Please check your order number.");
      } else {
        setError(getErrorMessage(err));
      }
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (orderParam) {
      fetchOrder(orderParam);
    }
  }, [orderParam, fetchOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      fetchOrder(orderNumber.trim());
    }
  };

  const currentStepIndex = order ? statusSteps.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="min-h-screen bg-secondary py-24">
      <div className="container-width max-w-4xl mx-auto">
        <h1 className="text-[10px] uppercase tracking-[0.3em] text-center mb-4 text-gray-500 font-medium">Order Status</h1>
        <h2 className="text-4xl md:text-5xl font-medium text-center mb-12 tracking-tight">Track Your Shipment</h2>

        {/* Search Form */}
        <div className="bg-white p-0 mb-12 border-b border-gray-100 pb-12">
          <div className="flex gap-0">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ENTER ORDER NUMBER"
              className="flex-1 px-4 py-4 border-b border-black/20 focus:border-black bg-transparent focus:outline-none placeholder:text-gray-400 text-sm uppercase tracking-widest transition-colors"
            />
            <Button type="submit" variant="premium" disabled={isLoading} className="rounded-none">
              {isLoading ? "SEARCHING..." : "TRACK ORDER"}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8">
            <ErrorFallback
              variant={isNotFound ? "card" : "inline"}
              title={isNotFound ? "Order not found" : "Something went wrong"}
              description={error}
              onRetry={orderNumber.trim() ? () => fetchOrder(orderNumber.trim()) : undefined}
            />
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-white p-8 border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-bold text-lg">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded">
                  <div
                    className="h-full bg-accent rounded transition-all duration-500"
                    style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
                  />
                </div>
                <div className="relative flex justify-between">
                  {statusSteps.map((step, idx) => (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 ${
                          idx <= currentStepIndex ? "bg-accent text-white" : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span className={`text-xs mt-2 ${idx <= currentStepIndex ? "text-accent font-medium" : "text-gray-400"}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {order.status === "CANCELLED" && (
                <div className="mt-6 bg-error/10 text-error rounded-lg p-3 text-center">This order has been cancelled</div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white p-8 border border-gray-100 mb-6">
              <h2 className="font-semibold mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-gray-500">
                        {item.variantSize && `Size: ${item.variantSize}`}
                        {item.variantSize && item.variantColor && " / "}
                        {item.variantColor && `Color: ${item.variantColor}`}
                        {" × "}
                        {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">₦{(item.unitPrice * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>₦{Number(order.total).toLocaleString()}</span>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white p-8 border border-gray-100">
                <h2 className="font-semibold mb-3">Shipping Address</h2>
                <p className="text-gray-600">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  <br />
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Back to Shop */}
        <div className="text-center mt-8">
          <Link href="/shop" className="text-accent hover:underline">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-secondary flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
