"use client";

import { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettings } from "@/hooks/use-settings";
import { settingsSchema, SettingsFormValues } from "@/schemas/settings.schema";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SettingsSkeleton } from "@/components/admin/skeletons/SettingsSkeleton";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsLogoUpload } from "./SettingsLogoUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Receipt, Palette, Link2, Sparkles, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { aiService } from "@/services/ai.service";
import toast from "react-hot-toast";
import { AIConfigurationSection } from "./AIConfigurationSection";

export function SettingsContent() {
  const { settings, isLoading, updateSettings, isSaving } = useSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as Resolver<SettingsFormValues>,
    defaultValues: {
      storeName: "",
      storeEmail: "",
      currency: "NGN",
      notifyOrder: true,
      notifyLowStock: true,
      notifyReview: false,
      // Receipt fields
      storePhone: "",
      storeAddress: "",
      storeCity: "",
      storeState: "",
      storePostalCode: "",
      storeCountry: "Nigeria",
      logoUrl: "",
      receiptAccentColor: "#000000",
      receiptFooterText: "",
      returnPolicyUrl: "",
      termsUrl: "",
      // AI Configuration
      aiProvider: "DISABLED",
      aiApiKey: "",
      aiFallbackProvider: "DISABLED",
      aiFallbackApiKey: "",
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
        // Receipt fields
        storePhone: settings.storePhone || "",
        storeAddress: settings.storeAddress || "",
        storeCity: settings.storeCity || "",
        storeState: settings.storeState || "",
        storePostalCode: settings.storePostalCode || "",
        storeCountry: settings.storeCountry || "Nigeria",
        logoUrl: settings.logoUrl || "",
        receiptAccentColor: settings.receiptAccentColor || "#000000",
        receiptFooterText: settings.receiptFooterText || "",
        returnPolicyUrl: settings.returnPolicyUrl || "",
        termsUrl: settings.termsUrl || "",
        // AI Configuration
        aiProvider: (settings.aiProvider as "DISABLED" | "GROQ" | "OPENROUTER" | "GEMINI") || "DISABLED",
        aiApiKey: settings.aiApiKey || "",
        aiFallbackProvider: (settings.aiFallbackProvider as "DISABLED" | "GROQ" | "OPENROUTER" | "GEMINI") || "DISABLED",
        aiFallbackApiKey: settings.aiFallbackApiKey || "",
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

          {/* Receipt Branding */}
          <div className="pb-12 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <Receipt className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-medium tracking-tight">Receipt Branding</h2>
            </div>

            {/* Store Contact & Address */}
            <div className="space-y-6 max-w-2xl mb-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Store Contact</p>

              <FormField
                control={form.control}
                name="storePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+234 XXX XXX XXXX"
                        className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Displayed on receipts for customer contact</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storeAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Street Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123 Fashion Street"
                        className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="storeCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">City</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Lagos"
                          className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storeState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">State</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Lagos State"
                          className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="storePostalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                        Postal Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="100001"
                          className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storeCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                        Country
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nigeria"
                          className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-6 max-w-2xl mb-8">
              <div className="flex items-center gap-2 pt-4">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Branding</p>
              </div>

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Logo URL
                    </FormLabel>
                    <FormControl>
                      <SettingsLogoUpload
                        initialUrl={field.value}
                        onUpload={(url) => {
                          field.onChange(url);
                          form.setValue("logoUrl", url, { shouldDirty: true });
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Cloudinary URL for logo displayed on receipts</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receiptAccentColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Accent Color
                    </FormLabel>
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          className="w-12 h-10 p-1 cursor-pointer border border-gray-200 rounded-none"
                        />
                      </FormControl>
                      <Input
                        value={field.value || "#000000"}
                        onChange={field.onChange}
                        placeholder="#000000"
                        className="flex-1 border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300 font-mono"
                      />
                    </div>
                    <FormDescription className="text-xs">Primary color used in receipt headers</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receiptFooterText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Footer Message
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Thank you for shopping with us!"
                        rows={2}
                        className="border border-gray-200 rounded-none px-3 py-2 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300 resize-none"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Custom message displayed at the bottom of receipts</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Policy Links */}
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-2 pt-4">
                <Link2 className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Policy Links</p>
              </div>

              <FormField
                control={form.control}
                name="returnPolicyUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Return Policy URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://yourstore.com/returns"
                        className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="termsUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                      Terms & Conditions URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://yourstore.com/terms"
                        className="border-t-0 border-x-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black transition-colors bg-transparent placeholder:text-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
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

          {/* AI Configuration */}
          <AIConfigurationSection form={form} />

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
