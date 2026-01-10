import { adminAPI } from "@/lib/admin-api";

export const productsService = {
  getProducts: async (params?: { category?: string; limit?: number; offset?: number }) => {
    return adminAPI.getProducts(params);
  },

  getProduct: async (id: string) => {
    return adminAPI.getProduct(id);
  },

  createProduct: async (data: any) => {
    return adminAPI.createProduct(data);
  },

  updateProduct: async (id: string, data: any) => {
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
