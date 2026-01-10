import { adminAPI, User } from "@/lib/admin-api";

export const customersService = {
  getCustomers: async (params?: { page?: number; limit?: number; search?: string }) => {
    return await adminAPI.getUsers(params);
  },

  deleteCustomer: async (id: string) => {
    return await adminAPI.deleteUser(id);
  },
};
