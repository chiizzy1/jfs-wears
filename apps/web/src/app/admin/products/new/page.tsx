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
  bulkEnabled?: boolean;
  bulkPricingTiers?: { minQuantity: number; discountPercent: number }[];
  selectedSizes: string[];
  colorGroups: {
    colorName: string;
    colorHex?: string;
    images: { file?: File; preview: string; isMain: boolean }[];
  }[];
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const { categories, sizePresets, colorPresets, createProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // 1. Generate variants from sizes × colors with truly unique SKUs
      const generateUniqueSku = (name: string, size: string, colorName: string) => {
        const prefix = name
          .slice(0, 3)
          .toUpperCase()
          .replace(/[^A-Z]/g, "X");
        const sizeCode = size.slice(0, 2).toUpperCase();
        const colorCode = colorName
          .slice(0, 3)
          .toUpperCase()
          .replace(/[^A-Z]/g, "X");
        const uniqueId = crypto.randomUUID().slice(0, 8).toUpperCase();
        return `${prefix}-${sizeCode}-${colorCode}-${uniqueId}`;
      };

      const variants = data.colorGroups.flatMap((color) =>
        data.selectedSizes.map((size) => {
          const variantKey = `${color.colorName}-${size}`;
          const stockValue = (data as any).variantStocks?.[variantKey] ?? 0;
          return {
            size,
            color: color.colorName,
            sku: generateUniqueSku(data.name, size, color.colorName),
            stock: typeof stockValue === "string" ? parseInt(stockValue) || 0 : stockValue,
            priceAdjustment: 0,
          };
        })
      );

      console.log("Submitting Product Payload:", {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        gender: data.gender,
        isFeatured: data.isFeatured,
        bulkEnabled: data.bulkEnabled,
        bulkPricingTiers: data.bulkPricingTiers,
        variants,
        salePrice: data.salePrice || undefined,
        saleStartDate: data.saleStartDate || undefined,
        saleEndDate: data.saleEndDate || undefined,
      });

      // 2. Create the product first
      const product = await createProduct({
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        gender: data.gender,
        isFeatured: data.isFeatured,
        bulkEnabled: data.bulkEnabled,
        bulkPricingTiers: data.bulkPricingTiers,
        variants,
        salePrice: data.salePrice || undefined,
        saleStartDate: data.saleStartDate || undefined,
        saleEndDate: data.saleEndDate || undefined,
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
    } catch (error: any) {
      console.error("Failed to create product:", error);
      const errorMessage = error?.message || "Failed to create product. Please try again.";
      toast.error(`Error: ${errorMessage}`);
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
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-black">Products</h1>
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
