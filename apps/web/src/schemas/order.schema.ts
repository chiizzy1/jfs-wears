import { z } from "zod";

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const orderPaymentStatusSchema = z.object({
  paymentStatus: z.enum(PAYMENT_STATUSES),
});

export const orderTrackingSchema = z.object({
  carrierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
});

export type OrderStatusValues = z.infer<typeof orderStatusSchema>;
export type OrderPaymentStatusValues = z.infer<typeof orderPaymentStatusSchema>;
export type OrderTrackingValues = z.infer<typeof orderTrackingSchema>;
