import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersService } from "@/services/customers.service";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/api-client";

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
    mutationFn: (id: string) => customersService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      toast.success("Customer deactivated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
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
