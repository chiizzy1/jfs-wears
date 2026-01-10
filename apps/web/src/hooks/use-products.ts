import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";
import { toast } from "react-hot-toast";

export const useProducts = (params?: { category?: string }) => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products", params],
    queryFn: () => productsService.getProducts(params),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => productsService.getCategories(),
  });

  const deleteProductMutation = useMutation({
    mutationFn: productsService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const createProductMutation = useMutation({
    mutationFn: productsService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // toast.success("Product created successfully"); // Handled in component
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const uploadImagesMutation = useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => productsService.uploadProductImages(id, files),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload images");
    },
  });

  return {
    products: productsQuery.data || [],
    categories: categoriesQuery.data || [],
    isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
    isError: productsQuery.isError || categoriesQuery.isError,
    deleteProduct: deleteProductMutation.mutateAsync,
    isDeleting: deleteProductMutation.isPending,
    createProduct: createProductMutation.mutateAsync,
    isCreating: createProductMutation.isPending,
    updateProduct: updateProductMutation.mutateAsync,
    isUpdating: updateProductMutation.isPending,
    uploadImages: uploadImagesMutation.mutateAsync,
    isUploading: uploadImagesMutation.isPending,
  };
};

export const useProduct = (id: string) => {
  const queryClient = useQueryClient();

  // Ensure id is valid before querying
  const enabled = !!id && id !== "new";

  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsService.getProduct(id),
    enabled,
  });

  return {
    product: productQuery.data,
    isLoading: productQuery.isLoading,
    isError: productQuery.isError,
    error: productQuery.error,
  };
};
