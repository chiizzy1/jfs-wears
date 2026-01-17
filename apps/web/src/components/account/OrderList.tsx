"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    variantSize?: string;
    variantColor?: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export function OrderList() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadReceipt = async (orderId: string, orderNumber: string) => {
    try {
      setDownloadingId(orderId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts/${orderId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to download receipt");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Failed to download receipt:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;

      try {
        const data = await apiClient.get<Order[]>("/orders/my");
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-purple-100 text-purple-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      REFUNDED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-md p-6 animate-pulse border border-gray-100">
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-md p-12 text-center border border-gray-100 shadow-sm">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h2 className="text-xl font-medium mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6 text-sm">When you place an order, it will appear here.</p>
        <Link href="/shop">
          <Button variant="secondary">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-lg">Recent Orders</h2>
        <p className="text-muted-foreground text-sm">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-md p-6 shadow-sm border border-gray-100">
          {/* Order Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-50">
            <div>
              <p className="font-medium text-sm">Order #{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${getStatusColor(
                  order.status,
                )}`}
              >
                {order.status}
              </span>
              <span className="font-medium">₦{Number(order.total).toLocaleString()}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            {order.items.slice(0, 2).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate max-w-[60%]">
                  {item.productName}
                  {item.variantSize && ` - ${item.variantSize}`}
                  {item.variantColor && ` / ${item.variantColor}`}
                  {" × "}
                  {item.quantity}
                </span>
                <span>₦{(item.unitPrice * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            {order.items.length > 2 && <p className="text-xs text-muted-foreground">+{order.items.length - 2} more items</p>}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadReceipt(order.id, order.orderNumber)}
              disabled={downloadingId === order.id}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {downloadingId === order.id ? "Downloading..." : "Download Receipt"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
