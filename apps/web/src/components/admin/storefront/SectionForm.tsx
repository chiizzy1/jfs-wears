"use client";

import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { sectionSchema, SectionFormValues } from "@/schemas/storefront.schema";
import { StorefrontSection } from "@/types/storefront.types";
import { Category } from "@/types/category.types";
import { storefrontService } from "@/services/storefront.service";

interface SectionFormProps {
  initialData?: StorefrontSection | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function SectionForm({ initialData, categories, onSuccess, onCancel }: SectionFormProps) {
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema) as Resolver<SectionFormValues>,
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      type: initialData?.type || "FEATURED",
      categoryId: initialData?.categoryId || "",
      maxProducts: initialData?.maxProducts || 10,
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = async (values: SectionFormValues) => {
    try {
      // Sanitize categoryId - convert empty string to undefined
      const payload = {
        ...values,
        categoryId: values.categoryId && values.categoryId !== "" ? values.categoryId : undefined,
      };

      if (initialData) {
        await storefrontService.updateSection(initialData.id, payload);
        toast.success("Section updated successfully");
      } else {
        await storefrontService.createSection(payload as any);
        toast.success("Section created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error("Failed to save section");
      console.error(error);
    }
  };

  const sectionType = form.watch("type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField<SectionFormValues>
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FEATURED">Featured Products</SelectItem>
                  <SelectItem value="CATEGORY">Category Carousel</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>"Featured" shows curated items. "Category" shows items from a specific category.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<SectionFormValues>
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Title</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} placeholder="e.g. Trending Now" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<SectionFormValues>
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle (Optional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} placeholder="e.g. Our bestsellers" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {sectionType === "CATEGORY" && (
          <FormField<SectionFormValues>
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={(field.value as string) || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a category" />
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
        )}

        <FormField<SectionFormValues>
          control={form.control}
          name="maxProducts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Products</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as number} type="number" min={1} max={50} />
              </FormControl>
              <FormDescription>Limit the number of products shown in this carousel.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="premium" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {initialData ? "Update Section" : "Create Section"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
