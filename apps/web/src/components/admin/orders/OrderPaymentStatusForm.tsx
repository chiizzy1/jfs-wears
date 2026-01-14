"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAYMENT_STATUSES, orderPaymentStatusSchema, OrderPaymentStatusValues } from "@/schemas/order.schema";
import { ordersService } from "@/services/orders.service";

interface OrderPaymentStatusFormProps {
  orderId: string;
  currentStatus: string;
  paymentMethod: string;
  onSuccess: () => void;
}

export function OrderPaymentStatusForm({ orderId, currentStatus, paymentMethod, onSuccess }: OrderPaymentStatusFormProps) {
  const form = useForm<OrderPaymentStatusValues>({
    resolver: zodResolver(orderPaymentStatusSchema),
    defaultValues: {
      paymentStatus: currentStatus as any,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: OrderPaymentStatusValues) => {
    try {
      await ordersService.updatePaymentStatus(orderId, values.paymentStatus);
      toast.success("Payment status updated");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update payment status");
    }
  };

  return (
    <div className="bg-white p-6 border border-gray-100">
      <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-4 flex items-center gap-2">
        <CreditCard className="w-4 h-4" /> Payment
      </h2>
      <p className="text-sm text-black font-medium mb-3">Method: {paymentMethod.replace("_", " ")}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((status) => (
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
            disabled={isSubmitting || form.watch("paymentStatus") === currentStatus}
          >
            {isSubmitting ? "Updating..." : "Update Payment"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
