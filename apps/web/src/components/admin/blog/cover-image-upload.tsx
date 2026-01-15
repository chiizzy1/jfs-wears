"use client";

import { useRef, useState } from "react";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { blogService } from "@/services/blog.service";
import toast from "react-hot-toast";

interface CoverImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CoverImageUpload({ value, onChange, disabled }: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const result = await blogService.uploadImage(file);
      onChange(result.secureUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
      }}
      onDragOver={(e) => !disabled && e.preventDefault()}
      className={cn(
        "relative aspect-video border rounded-none flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-gray-50",
        isUploading ? "border-blue-500 bg-blue-50/50" : "border-dashed border-gray-300",
        value ? "border-solid border-gray-200 p-0" : "p-12",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
        disabled={disabled}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-sm text-blue-600 font-medium animate-pulse">Uploading...</p>
        </div>
      ) : value ? (
        <div className="relative w-full h-full group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white font-medium uppercase tracking-widest text-xs">Click to Replace</p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-2">
          <div className="bg-gray-100 p-3 rounded-full inline-block">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Click to upload cover</p>
            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
          </div>
        </div>
      )}
    </div>
  );
}
