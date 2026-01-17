"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { ImageIcon, Loader2, Star, StarOff } from "lucide-react";

import { Category } from "@/types/category.types";
import { storefrontService } from "@/services/storefront.service";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CategoryGridTabProps {
  categories: Category[];
  onRefresh: () => void;
}

const POSITION_LABELS: Record<number, string> = {
  1: "Main (Large)",
  2: "Side Top",
  3: "Side Bottom",
};

export function CategoryGridTab({ categories, onRefresh }: CategoryGridTabProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const [updatingPosition, setUpdatingPosition] = useState<string | null>(null);

  const featuredCategories = categories.filter((c) => c.isFeatured);
  const featuredCount = featuredCategories.length;

  const handleImageUpload = async (categoryId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(categoryId);
    try {
      await storefrontService.uploadCategoryImage(categoryId, file);
      toast.success("Category image updated!");
      onRefresh();
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(null);
    }
  };

  const handleToggleFeatured = async (categoryId: string, currentlyFeatured: boolean) => {
    const newFeaturedState = !currentlyFeatured;

    if (newFeaturedState && featuredCount >= 3) {
      toast.error("Maximum 3 featured categories. Unfeature another first.");
      return;
    }

    setTogglingFeatured(categoryId);
    try {
      await storefrontService.toggleCategoryFeatured(categoryId, newFeaturedState);
      toast.success(newFeaturedState ? "Category featured!" : "Category unfeatured");
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update featured status";
      toast.error(message);
      console.error(error);
    } finally {
      setTogglingFeatured(null);
    }
  };

  const handlePositionChange = async (categoryId: string, position: string) => {
    const pos = parseInt(position, 10);
    setUpdatingPosition(categoryId);
    try {
      await storefrontService.updateCategoryFeaturedPosition(categoryId, pos);
      toast.success(`Moved to ${POSITION_LABELS[pos]}`);
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update position";
      toast.error(message);
      console.error(error);
    } finally {
      setUpdatingPosition(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Category Grid</strong> appears on the homepage as "Shop by Category". Mark up to{" "}
          <strong>3 categories as "Featured"</strong> to display them in the premium grid.
        </p>
        <p className="text-xs text-blue-600 mt-2">
          <strong>Position 1</strong> = Main large image &nbsp;|&nbsp;
          <strong>Position 2-3</strong> = Side images
        </p>
        <p className="text-xs text-gray-500 mt-1">Featured: {featuredCount}/3</p>
      </div>

      {categories.length === 0 ? (
        <div className="border border-dashed border-gray-300 py-12 text-center bg-gray-50/50">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No categories found</p>
          <p className="text-sm text-gray-400 mt-1">Create categories first in the Categories page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "border bg-white group relative",
                category.isFeatured ? "border-black ring-2 ring-black" : "border-gray-200",
              )}
            >
              {/* Featured Badge with Position */}
              {category.isFeatured && (
                <div className="absolute top-3 left-3 z-10 bg-black text-white text-xs font-bold py-1 px-2 uppercase tracking-wider">
                  {category.featuredPosition === 1 ? "★ MAIN" : `#${category.featuredPosition || "?"}`}
                </div>
              )}

              {/* Category Image */}
              <div className="aspect-4/3 bg-gray-100 relative overflow-hidden">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-12 w-12 opacity-50" />
                  </div>
                )}

                {/* Upload overlay */}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(category.id, file);
                    }}
                    disabled={uploading === category.id}
                  />
                  {uploading === category.id ? (
                    <div className="text-white text-center">
                      <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-white" />
                      <span className="text-sm font-medium tracking-wide">Uploading...</span>
                    </div>
                  ) : (
                    <div className="text-white text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <span className="text-sm font-medium tracking-wide uppercase">Click to upload</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Category Info & Actions */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-lg uppercase tracking-tight">{category.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">/{category.slug}</p>
                    </div>
                    <Button
                      variant={category.isFeatured ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleFeatured(category.id, !!category.isFeatured)}
                      disabled={togglingFeatured === category.id || (!category.isFeatured && featuredCount >= 3)}
                      className={cn("shrink-0", category.isFeatured && "bg-black hover:bg-gray-800")}
                    >
                      {togglingFeatured === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : category.isFeatured ? (
                        <>
                          <StarOff className="h-4 w-4 mr-1" /> Unfeature
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-1" /> Feature
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Position Selector - Only for featured categories */}
                  {category.isFeatured && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Position:</span>
                      <Select
                        value={category.featuredPosition?.toString() || "1"}
                        onValueChange={(val) => handlePositionChange(category.id, val)}
                        disabled={updatingPosition === category.id}
                      >
                        <SelectTrigger className="h-8 text-base sm:text-xs flex-1">
                          {updatingPosition === category.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue />}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Main (Large Image)</SelectItem>
                          <SelectItem value="2">2 - Side Top</SelectItem>
                          <SelectItem value="3">3 - Side Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
