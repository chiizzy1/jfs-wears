import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/api-client";

export const useOrders = (params?: { status?: string }) => {
  const queryClient = useQueryClient();

  // Handle "all" status by passing undefined
  const validStatus = params?.status === "all" ? undefined : params?.status;

  const ordersQuery = useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersService.getOrders({ ...params, status: validStatus }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
};
