import { UseFormReturn } from "react-hook-form";
import { CheckoutValues } from "@/schemas/checkout.schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CheckoutFormProps {
  form: UseFormReturn<CheckoutValues>;
  availableStates: string[];
  handleStateChange: (state: string) => void;
  selectedZoneName?: string;
  shippingFee: number;
}

export function CheckoutForm({ form, availableStates, handleStateChange, selectedZoneName, shippingFee }: CheckoutFormProps) {
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="bg-white p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-6">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="First Name" {...field} className="bg-transparent border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Last Name" {...field} className="bg-transparent border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Email Address" {...field} className="bg-transparent border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Phone Number" {...field} className="bg-transparent border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-6">Shipping Address</h2>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Street Address" {...field} className="bg-transparent border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="City" {...field} className="bg-transparent border-gray-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleStateChange(e.target.value);
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-black bg-white text-sm"
                    >
                      <option value="">Select State</option>
                      {availableStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {selectedZoneName && (
            <p className="text-sm text-muted-foreground italic">
              Shipping to {selectedZoneName}: ₦{shippingFee.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-6">Payment Method</h2>
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <div className="space-y-3">
                  {/* Card */}
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${
                      field.value === "card" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value="card"
                      checked={field.value === "card"}
                      onChange={field.onChange}
                      className="accent-black h-4 w-4"
                    />
                    <span className="text-sm font-medium">Card Payment (Paystack)</span>
                  </label>

                  {/* Transfer */}
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${
                      field.value === "transfer" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value="transfer"
                      checked={field.value === "transfer"}
                      onChange={field.onChange}
                      className="accent-black h-4 w-4"
                    />
                    <span className="text-sm font-medium">Bank Transfer</span>
                  </label>

                  {/* COD */}
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${
                      field.value === "cod" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value="cod"
                      checked={field.value === "cod"}
                      onChange={field.onChange}
                      className="accent-black h-4 w-4"
                    />
                    <span className="text-sm font-medium">Cash on Delivery (Lagos Only)</span>
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
