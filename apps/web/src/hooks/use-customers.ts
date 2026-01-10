import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersService } from "@/services/customers.service";
import { toast } from "react-hot-toast";

export const CUSTOMERS_QUERY_KEY = ["customers"];

export function useCustomers() {
  const queryClient = useQueryClient();

  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: CUSTOMERS_QUERY_KEY,
    queryFn: async () => {
      const response = await customersService.getCustomers({ limit: 100 });
      return Array.isArray(response) ? response : response.items || [];
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: customersService.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      toast.success("Customer deactivated");
    },
    onError: (error) => {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to deactivate customer");
    },
  });

  return {
    customers,
    isLoading,
    error,
    deleteCustomer: deleteCustomer.mutate,
    isDeleting: deleteCustomer.isPending,
  };
}
