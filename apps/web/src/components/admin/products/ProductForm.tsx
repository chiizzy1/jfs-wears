"use client";

import { useForm, useFieldArray, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { productSchema, ProductFormValues } from "@/schemas/product.schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/lib/admin-api";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { AIProductGenerator } from "./AIProductGenerator";
import { GeneratedProduct } from "@/services/ai.service";

interface ProductFormProps {
  categories: Category[];
  onSubmit: (data: ProductFormValues, images: File[]) => void;
  isSubmitting: boolean;
  initialData?: ProductFormValues;
}

export function ProductForm({ categories, onSubmit, isSubmitting, initialData }: ProductFormProps) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>, // Type-safe resolver cast
    defaultValues: initialData || {
      name: "",
      description: "",
      basePrice: 0,
      categoryId: "",
      gender: "UNISEX",
      isFeatured: false,
      bulkEnabled: false,
      bulkPricingTiers: [],
      variants: [{ size: "", color: "", sku: "", stock: 0, priceAdjustment: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const {
    fields: bulkFields,
    append: appendBulk,
    remove: removeBulk,
  } = useFieldArray({
    control: form.control,
    name: "bulkPricingTiers",
  });

  const isBulkEnabled = form.watch("bulkEnabled");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFormSubmit = (data: ProductFormValues) => {
    const files = images.map((img) => img.file);
    onSubmit(data, files);
  };

  const generateSku = (index: number) => {
    const name = form.getValues("name");
    const variants = form.getValues("variants") || [];
    const variant = variants[index];

    if (!name || !variant) return;

    const prefix = name.slice(0, 2).toUpperCase() || "PR";
    const size = variant.size?.slice(0, 1).toUpperCase() || "X";
    const color = variant.color?.slice(0, 3).toUpperCase() || "CLR";
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    form.setValue(`variants.${index}.sku`, `${prefix}-${size}-${color}-${random}`);
  };

  // Handler for AI-generated product content
  const handleAIApply = (generated: GeneratedProduct) => {
    form.setValue("name", generated.name);
    form.setValue("description", generated.description);
    form.setValue("gender", generated.gender);
    // Try to match category by name
    const matchedCategory = categories.find((cat) => cat.name.toLowerCase() === generated.suggestedCategory.toLowerCase());
    if (matchedCategory) {
      form.setValue("categoryId", matchedCategory.id);
    }
  };

  // Get first image URL for AI analysis
  const firstImageUrl = images.length > 0 ? images[0].preview : undefined;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Premium Hoodie" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price (₦)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} min={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MEN">Men</SelectItem>
                      <SelectItem value="WOMEN">Women</SelectItem>
                      <SelectItem value="UNISEX">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Product</FormLabel>
                    <FormDescription>Show on homepage</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sale Information */}
        <div className="bg-white p-6 border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Sale Information (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Price (₦)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 5000"
                      {...field}
                      value={field.value || ""} // Handle 0 or undefined gracefully
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : Number(e.target.value);
                        field.onChange(val);
                      }}
                      min={0}
                    />
                  </FormControl>
                  <FormDescription>Must be lower than Base Price</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saleStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saleEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden group">
                <Image src={img.preview} alt={`Product ${index}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Add Image</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* AI Product Generator */}
        <div className="bg-white p-6 border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">Upload an image above, then use AI to generate product details</p>
          <AIProductGenerator imageUrl={firstImageUrl} onApply={handleAIApply} disabled={isSubmitting} />
        </div>

        {/* Bulk Pricing */}
        <div className="bg-white p-6 border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bulk Pricing</h2>
            <FormField
              control={form.control}
              name="bulkEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal text-gray-600">Enable Bulk Discounts</FormLabel>
                </FormItem>
              )}
            />
          </div>

          {isBulkEnabled && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Define discount tiers based on quantity.</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendBulk({ minQuantity: 10, discountPercent: 5 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>

              {bulkFields.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed text-sm text-gray-500">
                  No pricing tiers added. Click "Add Tier" to start.
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left p-3 font-medium">Min Quantity</th>
                        <th className="text-left p-3 font-medium">Discount (%)</th>
                        <th className="text-right p-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bulkFields.map((field, index) => (
                        <tr key={field.id} className="bg-white">
                          <td className="p-3">
                            <FormField
                              control={form.control}
                              name={`bulkPricingTiers.${index}.minQuantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="number" {...field} min={2} className="w-24 h-8" placeholder="Qty" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </td>
                          <td className="p-3">
                            <FormField
                              control={form.control}
                              name={`bulkPricingTiers.${index}.discountPercent`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="relative w-24">
                                      <Input
                                        type="number"
                                        {...field}
                                        min={0}
                                        max={100}
                                        step={0.1}
                                        className="h-8 pr-6"
                                        placeholder="%"
                                      />
                                      <span className="absolute right-2 top-1.5 text-xs text-gray-500">%</span>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                              onClick={() => removeBulk(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Variants */}
        <div className="bg-white p-6 border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Variants</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ size: "", color: "", sku: "", stock: 0, priceAdjustment: 0 })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          </div>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50 items-end">
                <FormField
                  control={form.control}
                  name={`variants.${index}.size`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Size</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. M" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.color`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Color</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.sku`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">SKU</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} placeholder="SKU-123" />
                        </FormControl>
                        <Button type="button" variant="outline" size="icon" onClick={() => generateSku(index)}>
                          <span className="text-xs font-bold">G</span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.stock`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
