"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettings } from "@/hooks/use-settings";
import { settingsSchema, SettingsFormValues } from "@/schemas/settings.schema";
import { Button } from "@/components/ui/button";
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin"></div>
      </div>
    );
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
          <div className="bg-white border border-gray-100 p-8">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-8">General Settings</h2>
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
                      <Input {...field} className="focus-visible:ring-black" />
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
                      <Input {...field} type="email" className="focus-visible:ring-black" />
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
                        <SelectTrigger className="focus-visible:ring-black">
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
          <div className="bg-white border border-gray-100 p-8">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-8">Notifications</h2>
            <div className="space-y-4 max-w-2xl">
              <FormField
                control={form.control}
                name="notifyOrder"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors rounded-sm space-y-0">
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
                  <FormItem className="flex items-center justify-between p-4 bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors rounded-sm space-y-0">
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
                  <FormItem className="flex items-center justify-between p-4 bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors rounded-sm space-y-0">
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
          <div className="bg-white border border-gray-100 p-8">
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-8">Payment Settings</h2>
            <div className="space-y-4 max-w-2xl">
              <div className="p-4 bg-secondary flex items-center justify-between rounded-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 flex items-center justify-center rounded-sm">
                    <span className="text-green-600 font-bold">P</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Paystack</p>
                    <p className="text-xs text-muted-foreground">Accept card payments</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-medium rounded-full">
                  Connected
                </span>
              </div>
              <div className="p-4 bg-secondary flex items-center justify-between rounded-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-sm">
                    <span className="text-blue-600 font-bold">B</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">Manual bank transfers</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="px-8 bg-black text-white text-xs uppercase tracking-[0.15em] hover:bg-black/90"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
