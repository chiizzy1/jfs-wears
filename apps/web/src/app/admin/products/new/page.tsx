"use client";

import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/use-products";
import { ProductFormV2 } from "@/components/admin/products/ProductFormV2";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { adminAPI } from "@/lib/admin-api";
import { useState } from "react";

interface FormData {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  gender: "MEN" | "WOMEN" | "UNISEX";
  isFeatured?: boolean;
  selectedSizes: string[];
  colorGroups: {
    colorName: string;
    colorHex?: string;
    images: { file?: File; preview: string; isMain: boolean }[];
  }[];
}

export default function AddProductPage() {
  const router = useRouter();
  const { categories, sizePresets, colorPresets, createProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // 1. Generate variants from sizes × colors
      const variants = data.colorGroups.flatMap((color) =>
        data.selectedSizes.map((size) => ({
          size,
          color: color.colorName,
          sku: `${data.name.slice(0, 3).toUpperCase()}-${size.slice(0, 2).toUpperCase()}-${color.colorName
            .slice(0, 3)
            .toUpperCase()}-${Date.now().toString().slice(-4)}`,
          stock: 0, // Default stock, can be updated later
          priceAdjustment: 0,
        }))
      );

      // 2. Create the product first
      const product = await createProduct({
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        gender: data.gender,
        isFeatured: data.isFeatured,
        variants,
      });

      // 3. Create color groups and upload images for each
      for (const colorGroup of data.colorGroups) {
        // Create color group
        const createdColorGroup = await adminAPI.createColorGroup(product.id, {
          colorName: colorGroup.colorName,
          colorHex: colorGroup.colorHex,
        });

        // Upload images for this color group
        const filesToUpload = colorGroup.images.filter((img) => img.file).map((img) => img.file as File);

        if (filesToUpload.length > 0) {
          await adminAPI.uploadColorGroupImages(product.id, createdColorGroup.id, filesToUpload);
        }
      }

      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - matches products list page style */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Products</h1>
          <p className="text-2xl font-light mt-1">Add New Product</p>
        </div>
      </div>

      {/* Form */}
      <div>
        <ProductFormV2
          categories={categories}
          sizePresets={sizePresets}
          colorPresets={colorPresets}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
