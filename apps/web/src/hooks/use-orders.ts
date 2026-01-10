import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { toast } from "react-hot-toast";

export const useOrders = (params?: { status?: string }) => {
  const queryClient = useQueryClient();

  // Handle "all" status by passing undefined to service if needed,
  // but adminAPI seems to take status as string.
  // If status is "all", we might pass undefined or handle it in the service.
  // Checking admin-api.ts: if (params?.status) search.set("status", params.status);
  // So if we pass "all", it sets ?status=all. The backend likely needs to handle "all" or we shouldn't send it.
  // Usually backends ignore "all" or expect it to be omitted.
  // Let's assume we pass undefined if "all".
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
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update order status");
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
