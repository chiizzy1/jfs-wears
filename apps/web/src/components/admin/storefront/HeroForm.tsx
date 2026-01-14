"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, Video, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { heroSchema, HeroFormValues } from "@/schemas/storefront.schema";
import { StorefrontHero } from "@/types/storefront.types";
import { Category } from "@/types/category.types";
import { storefrontService } from "@/services/storefront.service";

interface HeroFormProps {
  initialData?: StorefrontHero | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function HeroForm({ initialData, categories, onSuccess, onCancel }: HeroFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      headline: initialData?.headline || "",
      subheadline: initialData?.subheadline || "",
      ctaText: initialData?.ctaText || "Shop Now",
      ctaLink: initialData?.ctaLink || "",
      mediaUrl: initialData?.mediaUrl || "",
      mediaType: initialData?.mediaType || "IMAGE",
      categoryId: initialData?.categoryId || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = async (values: HeroFormValues) => {
    try {
      if (initialData) {
        await storefrontService.updateHero(initialData.id, values);
        toast.success("Hero updated successfully");
      } else {
        await storefrontService.createHero(values as any); // Type assertion needed as backend expects simpler obj
        toast.success("Hero created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error("Failed to save hero");
      console.error(error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate type and size
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isImage && !isVideo) {
      toast.error("Invalid file type. Please upload an image or video.");
      return;
    }
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${isVideo ? "100MB" : "10MB"}`);
      return;
    }

    setIsUploading(true);
    try {
      const result = await storefrontService.uploadMedia(file);
      form.setValue("mediaUrl", result.secureUrl);
      form.setValue("mediaType", result.mediaType);
      toast.success("Media uploaded");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Media Upload */}
        <div className="space-y-2">
          <FormLabel>Media (Image or Video)</FormLabel>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isUploading
                ? "border-blue-400 bg-blue-50"
                : form.watch("mediaUrl")
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            ) : form.watch("mediaUrl") ? (
              <div className="space-y-2">
                {form.watch("mediaType") === "VIDEO" ? (
                  <video src={form.watch("mediaUrl")} className="h-32 mx-auto rounded" muted />
                ) : (
                  <img src={form.watch("mediaUrl")} alt="Preview" className="h-32 mx-auto rounded object-cover" />
                )}
                <p className="text-sm text-green-600 font-medium">Media uploaded ✓</p>
                <p className="text-xs text-gray-400">Click to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Click to upload image or video</p>
              </div>
            )}
          </div>
          <p className="text-xs text-red-500">{form.formState.errors.mediaUrl?.message}</p>
        </div>

        <FormField<HeroFormValues>
          control={form.control}
          name="headline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Headline</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} placeholder="Heading text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<HeroFormValues>
          control={form.control}
          name="subheadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subheadline</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value as string} placeholder="Subtext" rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField<HeroFormValues>
            control={form.control}
            name="ctaText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CTA Text</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value as string} placeholder="Shop Now" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField<HeroFormValues>
            control={form.control}
            name="ctaLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CTA Link</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value as string} placeholder="/shop" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField<HeroFormValues>
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link to Category (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="premium" disabled={form.formState.isSubmitting || isUploading}>
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {initialData ? "Update Hero" : "Create Hero"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
