import { adminAPI } from "@/lib/admin-api";
import { Order } from "@/types/order.types";
import { OrderTrackingValues } from "@/schemas/order.schema";

export const ordersService = {
  getOrders: async (params?: { status?: string; limit?: number; offset?: number }) => {
    // Cast the response to our strict Order type
    return adminAPI.getOrders(params) as Promise<{ items: Order[]; total: number; page: number } | Order[]>;
  },

  getOrder: async (id: string) => {
    return adminAPI.getOrder(id) as Promise<Order>;
  },

  updateOrderStatus: async (id: string, status: string) => {
    return adminAPI.updateOrderStatus(id, status) as Promise<Order>;
  },

  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    return adminAPI.patch<Order>(`/orders/${id}/payment-status`, { paymentStatus });
  },

  updateTracking: async (id: string, data: OrderTrackingValues) => {
    return adminAPI.put<Order>(`/orders/${id}/tracking`, data);
  },
};
