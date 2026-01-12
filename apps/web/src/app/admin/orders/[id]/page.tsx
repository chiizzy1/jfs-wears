"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { ArrowLeft, Package, Truck, User, MapPin, CreditCard, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  productName: string;
  variantSize?: string;
  variantColor?: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: string;
  shippingFee: string;
  discount: string;
  tax?: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryDate?: string;
  trackingNumber?: string;
  carrierName?: string;
  notes?: string;
  guestEmail?: string;
  guestPhone?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    phone?: string;
  };
  items: OrderItem[];
}

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<Order>(`/orders/${orderId}`);
      setOrder(data);
      // Initialize edit states
      setStatus(data.status);
      setPaymentStatus(data.paymentStatus);
      setTrackingNumber(data.trackingNumber || "");
      setCarrierName(data.carrierName || "");
      setEstimatedDeliveryDate(data.estimatedDeliveryDate?.split("T")[0] || "");
      setNotes(data.notes || "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setIsSaving(true);
      await apiClient.patch(`/orders/${orderId}/status`, { status });
      toast.success("Order status updated");
      fetchOrder();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      setIsSaving(true);
      await apiClient.patch(`/orders/${orderId}/payment-status`, { paymentStatus });
      toast.success("Payment status updated");
      fetchOrder();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTracking = async () => {
    try {
      setIsSaving(true);
      await apiClient.put(`/orders/${orderId}/tracking`, {
        trackingNumber: trackingNumber || undefined,
        carrierName: carrierName || undefined,
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
      });
      toast.success("Tracking information updated");
      fetchOrder();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin"></div>
      </div>
    );
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
                    <p className="text-sm text-muted">
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
                  <p className="text-sm text-muted">{order.user.email}</p>
                </>
              ) : (
                <>
                  <p className="font-medium">Guest Customer</p>
                  {order.guestEmail && <p className="text-sm text-muted">{order.guestEmail}</p>}
                  {order.guestPhone && <p className="text-sm text-muted">{order.guestPhone}</p>}
                </>
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
              <p className="text-muted">{order.shippingAddress.address}</p>
              <p className="text-muted">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              {order.shippingAddress.phone && <p className="text-muted">{order.shippingAddress.phone}</p>}
            </div>
          </div>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Update Order Status */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">Order Status</h2>
            <div className="space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 text-sm cursor-pointer"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button
                variant="premium"
                className="w-full"
                onClick={handleUpdateStatus}
                disabled={isSaving || status === order.status}
              >
                {isSaving ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>

          {/* Update Payment Status */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-muted">Method: {order.paymentMethod.replace("_", " ")}</p>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 text-sm cursor-pointer"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button
                variant="premium"
                className="w-full"
                onClick={handleUpdatePaymentStatus}
                disabled={isSaving || paymentStatus === order.paymentStatus}
              >
                {isSaving ? "Updating..." : "Update Payment"}
              </Button>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Tracking Info
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted block mb-1">Carrier Name</label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  placeholder="e.g., GIG Logistics"
                  className="w-full px-3 py-2 border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., GIG-1234567890"
                  className="w-full px-3 py-2 border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Est. Delivery Date
                </label>
                <input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 text-sm cursor-pointer"
                />
              </div>
              <Button variant="premium" className="w-full" onClick={handleUpdateTracking} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Tracking"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
