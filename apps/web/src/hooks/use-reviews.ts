import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    profileImage?: string;
  };
  product?: {
    id: string;
    name: string;
  };
}

export interface ReviewStats {
  count: number;
  average: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

interface UseReviewsParams {
  productId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  rating?: number | null;
}

export function useProductReviews({ productId, page = 1, limit = 5, sortBy = "newest", rating }: UseReviewsParams) {
  return useQuery({
    queryKey: ["reviews", productId, { page, limit, sortBy, rating }],
    queryFn: () =>
      apiClient.get<ReviewsResponse>(
        `/reviews/product/${productId}?page=${page}&limit=${limit}&sortBy=${sortBy}${rating ? `&rating=${rating}` : ""}`
      ),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
}

export function useSubmitReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { rating: number; title: string; comment: string }) =>
      apiClient.post(`/reviews/product/${productId}`, data),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      // Invalidate reviews to refetch
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (error: any) => {
      // Error is handled globally or via toast here if needed, but apiClient usually throws.
      // We can grab the specific message if passed.
      const message = error.response?.data?.message || "Failed to submit review";
      toast.error(message);
    },
  });
}

// Admin Hooks

interface AdminReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useAdminReviews({ page = 1, limit = 20, search = "", status = "all" }: AdminReviewsParams) {
  return useQuery({
    queryKey: ["admin-reviews", { page, limit, search, status }],
    queryFn: () =>
      apiClient.get<ReviewsResponse>(`/reviews/admin/all?page=${page}&limit=${limit}&status=${status}&search=${search}`),
  });
}

export function useReviewAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action, value }: { id: string; action: "approve" | "delete"; value?: boolean }) => {
      if (action === "approve") {
        return apiClient.patch(`/reviews/admin/${id}/status`, { isApproved: value });
      }
      return apiClient.delete(`/reviews/admin/${id}`);
    },
    onSuccess: () => {
      toast.success("Action completed");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: () => {
      toast.error("Action failed");
    },
  });
}
