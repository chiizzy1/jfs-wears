"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Category, CategoryFormData } from "@/types/category.types";
import { categorySchema, CategoryValues } from "@/schemas/category.schema";
import { categoriesService } from "@/services/categories.service";

interface CategoryFormProps {
  initialData?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const { isSubmitting } = form.formState;

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    if (!initialData) {
      form.setValue("slug", generateSlug(name));
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const result = await categoriesService.uploadImage(file);
      form.setValue("imageUrl", result.secureUrl);
      toast.success("Image uploaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: CategoryValues) => {
    try {
      if (initialData) {
        await categoriesService.update(initialData.id, values);
        toast.success("Category updated");
      } else {
        await categoriesService.create(values);
        toast.success("Category created");
      }
      onSuccess();
    } catch (error: any) {
      console.error(error);
      const message = error?.message || "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-[0.15em] text-gray-500">Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    handleNameChange(e);
                    field.onChange(e);
                  }}
                  placeholder="e.g., Hoodies"
                  className="rounded-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug Field */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-[0.15em] text-gray-500">Slug *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., hoodies" className="rounded-none font-mono text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-[0.15em] text-gray-500">Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Optional description" className="rounded-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Active Checkbox */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border border-gray-100">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="rounded-none data-[state=checked]:bg-black data-[state=checked]:text-white border-gray-300"
                />
              </FormControl>
              <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Active Status
              </FormLabel>
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-[0.15em] text-gray-500">Category Image</FormLabel>
              <FormControl>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.dataTransfer.files[0] && handleFileUpload(e.dataTransfer.files[0]);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isUploading
                      ? "border-blue-400 bg-blue-50"
                      : field.value
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center py-2">
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin mb-2" />
                      <p className="text-xs text-gray-500">Uploading...</p>
                    </div>
                  ) : field.value ? (
                    <div className="relative group">
                      <img src={field.value} alt="Category" className="h-20 mx-auto rounded object-cover shadow-sm" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          field.onChange("");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-green-600 mt-2">Click to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2">
                      <ImageIcon className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-500">Drag & drop or click to upload</p>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1 rounded-none" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="premium" className="flex-1" disabled={isSubmitting || isUploading}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {initialData ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
