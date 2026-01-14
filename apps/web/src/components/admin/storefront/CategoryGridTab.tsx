"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { ImageIcon, Loader2 } from "lucide-react";

import { Category } from "@/types/category.types";
import { storefrontService } from "@/services/storefront.service";

interface CategoryGridTabProps {
  categories: Category[];
  onRefresh: () => void;
}

export function CategoryGridTab({ categories, onRefresh }: CategoryGridTabProps) {
  const [uploading, setUploading] = useState<string | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-none p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Category Grid</strong> appears on the homepage as "Shop by Category". Upload images for each category to
          customize how they appear.
        </p>
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
            <div key={category.id} className="border border-gray-200 bg-white group">
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

              {/* Category Info */}
              <div className="p-4 border-t border-gray-100">
                <p className="font-medium text-lg uppercase tracking-tight">{category.name}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">/{category.slug}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
