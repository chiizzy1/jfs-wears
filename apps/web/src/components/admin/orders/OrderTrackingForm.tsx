"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Truck, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { orderTrackingSchema, OrderTrackingValues } from "@/schemas/order.schema";
import { ordersService } from "@/services/orders.service";

interface OrderTrackingFormProps {
  orderId: string;
  initialData: OrderTrackingValues;
  onSuccess: () => void;
}

export function OrderTrackingForm({ orderId, initialData, onSuccess }: OrderTrackingFormProps) {
  const form = useForm<OrderTrackingValues>({
    resolver: zodResolver(orderTrackingSchema),
    defaultValues: {
      carrierName: initialData.carrierName || "",
      trackingNumber: initialData.trackingNumber || "",
      estimatedDeliveryDate: initialData.estimatedDeliveryDate ? initialData.estimatedDeliveryDate.split("T")[0] : "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: OrderTrackingValues) => {
    try {
      await ordersService.updateTracking(orderId, values);
      toast.success("Tracking information updated");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update tracking info");
    }
  };

  return (
    <div className="bg-white p-6 border border-gray-100">
      <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-4 flex items-center gap-2">
        <Truck className="w-4 h-4" /> Tracking Info
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="carrierName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Carrier Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., GIG Logistics" className="rounded-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Tracking Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., GIG-1234567890" className="rounded-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estimatedDeliveryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Est. Delivery Date
                </FormLabel>
                <FormControl>
                  <Input type="date" className="cursor-pointer rounded-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="premium" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Tracking"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
