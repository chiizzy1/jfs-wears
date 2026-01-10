"use client";

import { useProduct, useProducts } from "@/hooks/use-products";
import { ProductForm } from "./ProductForm";
import { ProductFormValues } from "@/schemas/product.schema";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProductEditClientProps {
  id: string;
}

export function ProductEditClient({ id }: ProductEditClientProps) {
  const router = useRouter();
  const { product, isLoading: isLoadingProduct, isError: isProductError } = useProduct(id);
  const { categories, isLoading: isLoadingCategories, updateProduct, isUpdating, uploadImages } = useProducts();

  const isLoading = isLoadingProduct || isLoadingCategories;

  // Map backend product data to form values
  const initialData: ProductFormValues | undefined = product
    ? {
        name: product.name,
        description: product.description,
        basePrice: Number(product.basePrice),
        categoryId: product.categoryId,
        gender: (product.gender as "MEN" | "WOMEN" | "UNISEX") || "UNISEX",
        isFeatured: product.isFeatured || false,
        variants: product.variants.map((v: any) => ({
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock: v.stock,
          priceAdjustment: Number(v.priceAdjustment) || 0,
        })),
      }
    : undefined;

  const handleSubmit = async (data: ProductFormValues, images: File[]) => {
    try {
      await updateProduct({ id, data });

      if (images.length > 0) {
        await uploadImages({ id, files: images });
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      // Toast is handled in the hook
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-lg" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Make changes to your product here.</p>
        </div>
      </div>
      <ProductForm categories={categories} onSubmit={handleSubmit} isSubmitting={isUpdating} initialData={initialData} />
    </div>
  );
}
