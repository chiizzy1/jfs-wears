"use client";

import { useRouter } from "next/navigation";
import { Link } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { ProductFormValues } from "@/schemas/product.schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const { categories, createProduct, uploadImages } = useProducts();

  const handleSubmit = async (data: ProductFormValues, images: File[]) => {
    try {
      // 1. Create Product
      const product = await createProduct(data);

      // 2. Upload Images
      if (images.length > 0 && product.id) {
        await uploadImages({ id: product.id, files: images });
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Add New Product</h1>
      </div>

      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={false} // Loading state handled by hook/toast or could be passed if useMutation state exposed
      />
    </div>
  );
}
