import { apiClient } from "@/lib/api-client";
import { TrackOrderResponse } from "@/types/track.types";

export const trackService = {
  trackOrder: async (orderNumber: string) => {
    return apiClient.get<TrackOrderResponse>(`/orders/track/${orderNumber}`);
  },
};
