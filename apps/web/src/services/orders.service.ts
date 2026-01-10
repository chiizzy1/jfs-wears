import { adminAPI, Order } from "@/lib/admin-api";

export const ordersService = {
  getOrders: async (params?: { status?: string; limit?: number; offset?: number }) => {
    return adminAPI.getOrders(params);
  },

  getOrder: async (id: string) => {
    return adminAPI.getOrder(id);
  },

  updateOrderStatus: async (id: string, status: string) => {
    return adminAPI.updateOrderStatus(id, status);
  },
};
