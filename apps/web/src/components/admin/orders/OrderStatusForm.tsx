"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUSES, orderStatusSchema, OrderStatusValues } from "@/schemas/order.schema";
import { ordersService } from "@/services/orders.service";

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
  onSuccess: () => void;
}

export function OrderStatusForm({ orderId, currentStatus, onSuccess }: OrderStatusFormProps) {
  const form = useForm<OrderStatusValues>({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      status: currentStatus as any,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: OrderStatusValues) => {
    try {
      await ordersService.updateOrderStatus(orderId, values.status);
      toast.success("Order status updated");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="bg-white p-6 border border-gray-100">
      <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">Order Status</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="premium"
            className="w-full"
            disabled={isSubmitting || form.watch("status") === currentStatus}
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
