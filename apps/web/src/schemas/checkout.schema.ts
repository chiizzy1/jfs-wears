import { z } from "zod";

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "Please select a state"),
  paymentMethod: z.enum(["card", "transfer", "cod"], {
    message: "Please select a payment method",
  }),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
