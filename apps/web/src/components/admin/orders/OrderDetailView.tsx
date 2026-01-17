"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin, Sparkles, Loader2, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrderDetailSkeleton } from "@/components/admin/skeletons/OrderDetailSkeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/api-client";
import { ordersService } from "@/services/orders.service";
import { Order } from "@/types/order.types";
import { aiService } from "@/services/ai.service";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";

import { OrderStatusForm } from "./OrderStatusForm";
import { OrderPaymentStatusForm } from "./OrderPaymentStatusForm";
import { OrderTrackingForm } from "./OrderTrackingForm";

interface OrderDetailViewProps {
  orderId: string;
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ordersService.getOrder(orderId);
      setOrder(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
          <Link href="/admin/orders">
            <Button variant="outline">← Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-medium">{order.orderNumber}</h1>
            <p className="text-sm text-muted">
              Placed on{" "}
              {formatDate(order.createdAt, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.status} variant="badge" />
          <StatusBadge status={order.paymentStatus} variant="badge" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" /> Order Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-black">
                      {item.variantSize && `Size: ${item.variantSize}`}
                      {item.variantSize && item.variantColor && " / "}
                      {item.variantColor && `Color: ${item.variantColor}`}
                      {" × "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.total, false)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal, false)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount, false)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingFee, false)}</span>
              </div>
              {order.tax && Number(order.tax) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax, false)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 mt-2 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total, false)}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Customer
            </h2>
            <div className="space-y-2">
              {order.user ? (
                <>
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-sm text-black">{order.user.email}</p>
                </>
              ) : (
                <>
                  <p className="font-medium">Guest Customer</p>
                  {order.guestEmail && <p className="text-sm text-black">{order.guestEmail}</p>}
                  {order.guestPhone && <p className="text-sm text-black">{order.guestPhone}</p>}
                </>
              )}
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Shipping Address
            </h2>
            <div className="text-sm">
              <p className="font-medium">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-black">{order.shippingAddress.address}</p>
              <p className="text-black">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              {order.shippingAddress.postalCode && <p className="text-black">{order.shippingAddress.postalCode}</p>}
              {order.shippingAddress.country && <p className="text-black">{order.shippingAddress.country}</p>}
              {order.shippingAddress.phone && <p className="text-black mt-2">{order.shippingAddress.phone}</p>}
            </div>
          </div>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          <OrderStatusForm orderId={order.id} currentStatus={order.status} onSuccess={fetchOrder} />

          <OrderPaymentStatusForm
            orderId={order.id}
            currentStatus={order.paymentStatus}
            paymentMethod={order.paymentMethod}
            onSuccess={fetchOrder}
          />

          <OrderTrackingForm
            orderId={order.id}
            initialData={{
              carrierName: order.carrierName,
              trackingNumber: order.trackingNumber,
              estimatedDeliveryDate: order.estimatedDeliveryDate,
            }}
            onSuccess={fetchOrder}
          />

          {/* AI Response Generator */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Email Template
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      setIsGeneratingResponse(true);
                      const result = await aiService.generateOrderResponse({
                        orderNumber: order.orderNumber,
                        orderStatus: order.status,
                        customerName: order.user?.name || order.shippingAddress.firstName,
                      });
                      setAiResponse(result.response);
                      toast.success("Email template generated!");
                    } catch (e: any) {
                      toast.error(e.message || "Failed to generate");
                    } finally {
                      setIsGeneratingResponse(false);
                    }
                  }}
                  disabled={isGeneratingResponse}
                  className="flex-1 rounded-none gap-1 text-xs"
                >
                  {isGeneratingResponse ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Generate
                </Button>
              </div>
              {aiResponse && (
                <div className="space-y-2">
                  <Textarea
                    value={aiResponse}
                    onChange={(e) => setAiResponse(e.target.value)}
                    rows={6}
                    className="text-sm rounded-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(aiResponse);
                      setCopied(true);
                      toast.success("Copied to clipboard!");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full rounded-none gap-2"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
