"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettings } from "@/hooks/use-settings";
import { settingsSchema, SettingsFormValues } from "@/schemas/settings.schema";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SettingsSkeleton } from "@/components/admin/skeletons/SettingsSkeleton";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

export function SettingsContent() {
  const { settings, isLoading, updateSettings, isSaving } = useSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      storeName: "",
      storeEmail: "",
      currency: "NGN",
      notifyOrder: true,
      notifyLowStock: true,
      notifyReview: false,
    },
  });

  // Reset form with fetched data
  useEffect(() => {
    if (settings) {
      form.reset({
        storeName: settings.storeName || "",
        storeEmail: settings.storeEmail || "",
        currency: settings.currency || "NGN",
        notifyOrder: settings.notifyOrder ?? true,
        notifyLowStock: settings.notifyLowStock ?? true,
        notifyReview: settings.notifyReview ?? false,
      });
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsFormValues) => {
    updateSettings(data);
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground">Settings</h1>
        <p className="text-2xl font-light mt-1">Store Configuration</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Settings */}
          <div className="pb-12 border-b border-gray-100">
            <h2 className="text-lg font-medium tracking-tight mb-8">General Information</h2>
            <div className="space-y-6 max-w-2xl">
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Store Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storeEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Store Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Currency
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="pb-12 border-b border-gray-100">
            <h2 className="text-lg font-medium tracking-tight mb-8">Notifications</h2>
            <div className="space-y-4 max-w-2xl">
              <FormField
                control={form.control}
                name="notifyOrder"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-none space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium cursor-pointer">Order Notifications</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        Receive email when a new order is placed
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notifyLowStock"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-none space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium cursor-pointer">Low Stock Alerts</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        Get notified when product stock is low
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notifyReview"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-none space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium cursor-pointer">Customer Reviews</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        Receive notifications for new reviews
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Payment Settings (Static for now, but matched with UI) */}
          <div className="pb-12">
            <h2 className="text-lg font-medium tracking-tight mb-8">Payment Gateways</h2>
            <div className="space-y-4 max-w-2xl">
              <div className="py-4 border-b border-gray-100 flex items-center justify-between rounded-none">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black/5 flex items-center justify-center rounded-none">
                    <span className="text-black font-bold">P</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Paystack</p>
                    <p className="text-xs text-muted-foreground">Secure card payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Connected</span>
                </div>
              </div>
              <div className="py-4 flex items-center justify-between rounded-none">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black/5 flex items-center justify-center rounded-none">
                    <span className="text-black font-bold">B</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">Manual verification</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} variant="premium" className="px-8">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
