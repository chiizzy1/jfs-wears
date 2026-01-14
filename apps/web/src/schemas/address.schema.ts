import { z } from "zod";

export const addressSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  landmark: z.string().optional(),
  isDefault: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
