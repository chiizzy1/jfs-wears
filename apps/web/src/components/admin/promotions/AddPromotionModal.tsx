"use client";

import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { promotionSchema, PromotionFormValues } from "@/schemas/promotion.schema";
import { Promotion } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { aiService } from "@/services/ai.service";

interface AddPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PromotionFormValues) => void;
  initialData?: Promotion | null;
  isSubmitting: boolean;
}

export function AddPromotionModal({ isOpen, onClose, onSubmit, initialData, isSubmitting }: AddPromotionModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema) as Resolver<PromotionFormValues>,
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: "PERCENTAGE",
      value: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 0,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
    },
  });

  // AI Promotion Copy Generation
  const handleAIGenerate = async () => {
    const type = form.getValues("type");
    const value = form.getValues("value");
    if (!value || value === 0) {
      toast.error("Please enter a discount value first");
      return;
    }
    try {
      setIsGenerating(true);
      const result = await aiService.generatePromotionCopy({ type, value });
      form.setValue("name", result.name);
      form.setValue("description", result.description);
      // Auto-generate code from name
      const code = result.name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "")
        .substring(0, 10);
      form.setValue("code", code);
      toast.success("Promo copy generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description || "",
        type: initialData.type,
        value: initialData.value,
        minOrderAmount: initialData.minOrderAmount || 0,
        maxDiscount: initialData.maxDiscount || 0,
        usageLimit: initialData.usageLimit || 0,
        validFrom: new Date(initialData.validFrom).toISOString().split("T")[0],
        validTo: new Date(initialData.validTo).toISOString().split("T")[0],
        isActive: initialData.isActive,
      });
    } else {
      form.reset({
        code: "",
        name: "",
        description: "",
        type: "PERCENTAGE",
        value: 0,
        minOrderAmount: 0,
        maxDiscount: 0,
        usageLimit: 0,
        validFrom: new Date().toISOString().split("T")[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        isActive: true,
      });
    }
  }, [initialData, form, isOpen]);

  return (
    <Modal
      title={initialData ? "Edit Promotion" : "Create Promotion"}
      description={initialData ? "Update promotion details." : "Add a new discount code."}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* AI Generation Section */}
          <div className="bg-purple-50 border border-purple-200 p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <Sparkles className="h-4 w-4" />
              <span>Generate promo copy with AI</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAIGenerate}
              disabled={isGenerating || !form.getValues("value")}
              className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Code</FormLabel>
                  <FormControl>
                    <Input placeholder="SUMMER25" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Sale" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Optional description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount (₦)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="minOrderAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Order (₦)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} min={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxDiscount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Discount (₦)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} min={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Limit</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Unlimited" {...field} min={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid From</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid To</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                  <FormDescription>Enable or disable this promotion</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
