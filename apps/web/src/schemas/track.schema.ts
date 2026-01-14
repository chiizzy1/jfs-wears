import { z } from "zod";

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, "Please enter your order number"),
});

export type TrackOrderFormValues = z.infer<typeof trackOrderSchema>;
