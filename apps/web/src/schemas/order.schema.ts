import { z } from "zod";

export const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  variantSize: z.string().optional(),
  variantColor: z.string().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
  total: z.number(),
});

export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  items: z.array(orderItemSchema),
  subtotal: z.number(),
  shippingFee: z.number(),
  discount: z.number(),
  total: z.number(),
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
  createdAt: z.string(),
});

export type Order = z.infer<typeof orderSchema>;
