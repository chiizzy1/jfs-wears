import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionsService } from "@/services/promotions.service";
import { CreatePromotionDto } from "@/lib/admin-api";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/api-client";

export const PROMOTIONS_QUERY_KEY = ["promotions"];

export function usePromotions() {
  const queryClient = useQueryClient();

  const {
    data: promotions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: PROMOTIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await promotionsService.getPromotions();
      return Array.isArray(response) ? response : [];
    },
  });

  const createPromotion = useMutation({
    mutationFn: (data: CreatePromotionDto) => promotionsService.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      toast.success("Promotion created successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updatePromotion = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePromotionDto> }) => promotionsService.updatePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      toast.success("Promotion updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deletePromotion = useMutation({
    mutationFn: (id: string) => promotionsService.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      toast.success("Promotion deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    promotions,
    isLoading,
    error,
    createPromotion,
    updatePromotion,
    deletePromotion,
  };
}
