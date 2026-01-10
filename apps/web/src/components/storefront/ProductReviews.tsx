"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name?: string;
  };
}

interface ReviewStats {
  count: number;
  average: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { isAuthenticated, tokens } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, title: "", comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to leave a review");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success("Review submitted!");
      setShowForm(false);
      setFormData({ rating: 5, title: "", comment: "" });
      loadReviews();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit review";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    rating,
    interactive = false,
    onRate,
  }: {
    rating: number;
    interactive?: boolean;
    onRate?: (r: number) => void;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          disabled={!interactive}
        >
          <svg
            className={`w-5 h-5 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Customer Reviews</h2>
        {isAuthenticated && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Write a Review"}
          </Button>
        )}
      </div>

      {/* Stats */}
      {stats && stats.count > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{stats.average.toFixed(1)}</div>
              <StarRating rating={Math.round(stats.average)} />
              <div className="text-sm text-gray-500 mt-1">{stats.count} reviews</div>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-3">{star}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${
                          stats.count > 0 ? (stats.distribution[star as keyof typeof stats.distribution] / stats.count) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{stats.distribution[star as keyof typeof stats.distribution]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Write Your Review</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <StarRating rating={formData.rating} interactive onRate={(r) => setFormData({ ...formData, rating: r })} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title (optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
              placeholder="Summarize your experience"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Review (optional)</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent resize-none"
              rows={4}
              placeholder="Tell others about your experience..."
            />
          </div>

          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.user.name || "Anonymous"}</span>
                    {review.isVerified && (
                      <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Verified Purchase</span>
                    )}
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.title && <h4 className="font-medium mt-2">{review.title}</h4>}
              {review.comment && <p className="text-gray-600 text-sm mt-1">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Login Prompt */}
      {!isAuthenticated && (
        <div className="text-center py-4 text-sm text-gray-500">
          <a href="/login" className="text-accent hover:underline">
            Sign in
          </a>{" "}
          to leave a review
        </div>
      )}
    </div>
  );
}
