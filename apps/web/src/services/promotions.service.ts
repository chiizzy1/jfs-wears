import { adminAPI, CreatePromotionDto, Promotion } from "@/lib/admin-api";

export const promotionsService = {
  getPromotions: async () => {
    return await adminAPI.getPromotions(true);
  },

  createPromotion: async (data: CreatePromotionDto) => {
    return await adminAPI.createPromotion(data);
  },

  updatePromotion: async (id: string, data: Partial<CreatePromotionDto>) => {
    return await adminAPI.updatePromotion(id, data);
  },

  deletePromotion: async (id: string) => {
    return await adminAPI.deletePromotion(id);
  },
};
