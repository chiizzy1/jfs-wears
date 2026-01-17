import { adminAPI, CreateProductDto, Product } from "@/lib/admin-api";

export const productsService = {
  getProducts: async (params?: { category?: string; limit?: number; offset?: number; isOnSale?: boolean }) => {
    return adminAPI.getProducts(params);
  },

  getProduct: async (id: string) => {
    return adminAPI.getProduct(id);
  },

  createProduct: async (data: CreateProductDto): Promise<Product> => {
    return adminAPI.createProduct(data);
  },

  updateProduct: async (id: string, data: Partial<CreateProductDto>): Promise<Product> => {
    return adminAPI.updateProduct(id, data);
  },

  deleteProduct: async (id: string) => {
    return adminAPI.deleteProduct(id);
  },

  getCategories: async () => {
    return adminAPI.getCategories();
  },

  uploadProductImages: async (id: string, files: File[]) => {
    return adminAPI.uploadProductImages(id, files);
  },
};
