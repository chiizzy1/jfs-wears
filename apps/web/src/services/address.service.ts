import { apiClient } from "@/lib/api-client";
import { Address } from "@/types/address.types";
import { AddressFormValues } from "@/schemas/address.schema";

export const addressService = {
  getAll: async (): Promise<Address[]> => {
    return await apiClient.get<Address[]>("/users/addresses");
  },

  create: async (data: AddressFormValues): Promise<Address> => {
    return await apiClient.post<Address>("/users/addresses", data);
  },

  update: async (id: string, data: AddressFormValues): Promise<Address> => {
    return await apiClient.put<Address>(`/users/addresses/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/users/addresses/${id}`);
  },
};
