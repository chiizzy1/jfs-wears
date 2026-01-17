"use client";

import { useProduct, useProducts } from "@/hooks/use-products";
import { ProductFormV2 } from "./ProductFormV2";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { adminAPI } from "@/lib/admin-api";

interface ProductEditClientProps {
  id: string;
}

interface ColorGroupFormData {
  colorName: string;
  colorHex?: string;
  images: { file?: File; preview: string; isMain: boolean }[];
}

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
  colorGroups: ColorGroupFormData[];
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
}

export function ProductEditClient({ id }: ProductEditClientProps) {
  const router = useRouter();
  const { product, isLoading: isLoadingProduct, isError: isProductError } = useProduct(id);
  const {
    categories,
    sizePresets,
    colorPresets,
    isLoading: isLoadingCategories,
    updateProduct,
    isUpdating,
    createColorGroup,
    uploadColorGroupImages,
  } = useProducts();

  const isLoading = isLoadingProduct || isLoadingCategories;

  // Map backend product data to ProductFormV2 format
  const initialData = product
    ? {
        name: product.name,
        description: product.description,
        basePrice: Number(product.basePrice),
        categoryId: product.categoryId,
        gender: (product.gender as "MEN" | "WOMEN" | "UNISEX") || "UNISEX",
        isFeatured: product.isFeatured || false,
        bulkEnabled: product.bulkEnabled || false,
        bulkPricingTiers: (product.bulkPricingTiers || []).map((t: any) => ({
          minQuantity: Number(t.minQuantity),
          discountPercent: Number(t.discountPercent),
        })),
        // Extract unique sizes from variants
        selectedSizes: [...new Set(product.variants.map((v: any) => v.size).filter(Boolean))] as string[],
        // Map existing colorGroups with their images
        colorGroups: (product.colorGroups || []).map((cg: any) => ({
          colorName: cg.colorName,
          colorHex: cg.colorHex,
          images: (cg.images || []).map((img: any) => ({
            preview: img.url,
            isMain: img.isMain || false,
          })),
        })),
        salePrice: product.salePrice ? Number(product.salePrice) : 0,
        saleStartDate: product.saleStartDate ? new Date(product.saleStartDate).toISOString().slice(0, 16) : "",
        saleEndDate: product.saleEndDate ? new Date(product.saleEndDate).toISOString().slice(0, 16) : "",
      }
    : undefined;

  const handleSubmit = async (data: FormData) => {
    try {
      // 1. Generate variants from sizes × colors and map to existing variants to preserve Ids/Stock
      const variants = data.colorGroups.flatMap((color) =>
        data.selectedSizes.map((size) => {
          // Find existing variant - check BOTH deprecated 'color' field AND new 'colorGroup.colorName'
          const existingVariant = product?.variants?.find((v: any) => {
            const matchesSize = v.size === size;
            // Match by legacy color field OR by colorGroup relationship
            const matchesColor =
              v.color === color.colorName ||
              v.color?.toLowerCase() === color.colorName.toLowerCase() ||
              v.colorGroup?.colorName?.toLowerCase() === color.colorName.toLowerCase();
            return matchesSize && matchesColor;
          });

          // Generate truly unique SKU using crypto.randomUUID() to prevent collisions
          const generateUniqueSku = () => {
            const prefix = data.name
              .slice(0, 3)
              .toUpperCase()
              .replace(/[^A-Z]/g, "X");
            const sizeCode = size.slice(0, 2).toUpperCase();
            const colorCode = color.colorName
              .slice(0, 3)
              .toUpperCase()
              .replace(/[^A-Z]/g, "X");
            const uniqueId = crypto.randomUUID().slice(0, 8).toUpperCase();
            return `${prefix}-${sizeCode}-${colorCode}-${uniqueId}`;
          };

          // Get stock from form variantStocks if provided, otherwise preserve existing
          const variantKey = `${color.colorName}-${size}`;
          const formStockValue = (data as any).variantStocks?.[variantKey];
          const stockValue =
            formStockValue !== undefined
              ? typeof formStockValue === "string"
                ? parseInt(formStockValue) || 0
                : formStockValue
              : (existingVariant?.stock ?? 0);

          return {
            id: existingVariant?.id, // Important: Include ID to trigger update instead of create
            size,
            color: color.colorName,
            sku: existingVariant?.sku || generateUniqueSku(),
            stock: stockValue,
            priceAdjustment: existingVariant?.priceAdjustment ?? 0, // Preserve existing price adjustment
          };
        }),
      );

      // 2. Update the product
      await updateProduct({
        id,
        data: {
          name: data.name,
          description: data.description,
          basePrice: data.basePrice,
          categoryId: data.categoryId,
          gender: data.gender,
          isFeatured: data.isFeatured,
          bulkEnabled: data.bulkEnabled,
          bulkPricingTiers: data.bulkPricingTiers,
          variants, // Now includes IDs for existing variants
          salePrice: data.salePrice || undefined,
          saleStartDate: data.saleStartDate || undefined,
          saleEndDate: data.saleEndDate || undefined,
        },
      });

      // 3. Handle color groups and images
      // Note: For existing products, we need to manage color groups separately
      // This is a simplified version - for production, you'd compare existing vs new
      for (const colorGroup of data.colorGroups) {
        const newFiles = colorGroup.images.filter((img) => img.file).map((img) => img.file as File);

        if (newFiles.length > 0) {
          // Check if color group exists, if not create it
          const existingColorGroup = product?.colorGroups?.find(
            (cg: any) => cg.colorName.toLowerCase() === colorGroup.colorName.toLowerCase(),
          );

          if (existingColorGroup) {
            // Upload to existing color group
            await uploadColorGroupImages({
              productId: id,
              colorGroupId: existingColorGroup.id,
              files: newFiles,
            });
          } else {
            // Create new color group and upload
            const newCG = await createColorGroup({
              productId: id,
              data: {
                colorName: colorGroup.colorName,
                colorHex: colorGroup.colorHex,
              },
            });
            await uploadColorGroupImages({
              productId: id,
              colorGroupId: newCG.id,
              files: newFiles,
            });
          }
        }
      }

      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isProductError || !product) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load product. Please try again later or check if the product exists.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - matches new product page style */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Products</h1>
          <p className="text-2xl font-light mt-1">Edit Product</p>
        </div>
      </div>

      {/* Form */}
      <ProductFormV2
        categories={categories}
        sizePresets={sizePresets}
        colorPresets={colorPresets}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
        initialData={initialData}
        isEditing={true}
      />
    </div>
  );
}
