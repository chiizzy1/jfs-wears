"use client";

import { useForm, useFieldArray } from "react-hook-form";
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

interface ProductFormProps {
  categories: Category[];
  onSubmit: (data: ProductFormValues, images: File[]) => void;
  isSubmitting: boolean;
  initialData?: ProductFormValues;
}

export function ProductForm({ categories, onSubmit, isSubmitting, initialData }: ProductFormProps) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData || {
      name: "",
      description: "",
      basePrice: 0,
      categoryId: "",
      gender: "UNISEX",
      isFeatured: false,
      variants: [{ size: "", color: "", sku: "", stock: 0, priceAdjustment: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
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

        {/* Images */}
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
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

        {/* Variants */}
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
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
