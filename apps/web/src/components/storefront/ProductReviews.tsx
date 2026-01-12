"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { useProductReviews, useSubmitReview } from "@/hooks/use-reviews";
import { Star, ThumbsUp, Filter, CheckCircle2, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, title: "", comment: "" });

  const { data, isLoading } = useProductReviews({
    productId,
    page,
    limit: 5,
    sortBy,
    rating: filterRating,
  });

  const submitReview = useSubmitReview(productId);

  const stats = data?.stats;
  const reviews = data?.reviews || [];
  const meta = data?.meta;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    submitReview.mutate(formData, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ rating: 5, title: "", comment: "" });
      },
    });
  };

  const StarRating = ({
    rating,
    interactive = false,
    onRate,
    size = "md",
  }: {
    rating: number;
    interactive?: boolean;
    onRate?: (r: number) => void;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate?.(star)}
            className={cn(
              interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default",
              "focus:outline-none"
            )}
            disabled={!interactive}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200"
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="py-16 border-t border-gray-100 bg-white" id="reviews">
      <div className="container-width max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Column: Stats & Breakdown */}
          <div className="w-full md:w-1/3 space-y-8">
            <div>
              <h2 className="text-2xl font-bold font-serif mb-2">Customer Reviews</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-gray-900">{stats?.average.toFixed(1) || "0.0"}</span>
                <div className="space-y-1">
                  <StarRating rating={Math.round(stats?.average || 0)} size="md" />
                  <p className="text-sm text-gray-500">{stats?.count || 0} Reviews</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                  className="w-full group flex items-center gap-3 text-sm hover:bg-gray-50 p-1 rounded-md transition-colors"
                >
                  <span className="font-medium text-gray-700 w-3">{star}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-500"
                      style={{
                        width: `${
                          stats?.count && stats.count > 0
                            ? (stats.distribution[star as keyof typeof stats.distribution] / stats.count) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-8 text-right group-hover:text-gray-900">
                    {stats?.distribution[star as keyof typeof stats.distribution] || 0}
                  </span>
                </button>
              ))}
            </div>

            {isAuthenticated ? (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setShowForm(!showForm)}
                variant={showForm ? "outline" : "default"}
              >
                {showForm ? "Cancel Review" : "Write a Review"}
              </Button>
            ) : (
              <div className="bg-gray-50 p-6 text-center">
                <p className="text-gray-600 mb-4">Own this product? Log in to share your thoughts.</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/login?redirect=/product/${productId}`}>Log in to Review</a>
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Reviews List */}
          <div className="w-full md:w-2/3">
            {/* Filters Toolbar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <strong className="text-sm font-medium text-gray-900">{meta?.total || 0} Reviews</strong>
                {filterRating && (
                  <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFilterRating(null)}>
                    {filterRating} Stars <span className="text-xs">×</span>
                  </Badge>
                )}
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Review Form */}
            {showForm && (
              <div className="bg-gray-50 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                <h3 className="font-semibold mb-4">Write Your Review</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating</label>
                    <div className="flex gap-4">
                      <StarRating
                        rating={formData.rating}
                        interactive
                        onRate={(r) => setFormData({ ...formData, rating: r })}
                        size="lg"
                      />
                      <span className="text-sm font-medium text-gray-500 pt-1">
                        {formData.rating === 5
                          ? "Excellent!"
                          : formData.rating === 4
                          ? "Good"
                          : formData.rating === 3
                          ? "Average"
                          : formData.rating === 2
                          ? "Fair"
                          : "Poor"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      placeholder="Title of your review"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review</label>
                    <textarea
                      required
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm min-h-[120px]"
                      placeholder="Tell us about your experience..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitReview.isPending}>
                      {submitReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-4 bg-gray-100 rounded w-20" />
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                    <div className="h-16 bg-gray-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200">
                <p className="text-gray-500 mb-2">No reviews matches your filters.</p>
                {filterRating && (
                  <Button variant="link" onClick={() => setFilterRating(null)}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review.id} className="group border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                          {review.user.profileImage ? (
                            <img src={review.user.profileImage} alt={review.user.name} className="w-full h-full object-cover" />
                          ) : (
                            review.user.name?.[0] || "U"
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{review.user.name || "Anonymous"}</span>
                            {review.isVerified && (
                              <div className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pl-[52px]">
                      {review.title && <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>}
                      <p className="text-gray-600 leading-relaxed text-sm">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.lastPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-gray-700">
                  Page {page} of {meta.lastPage}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
                  disabled={page === meta.lastPage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
