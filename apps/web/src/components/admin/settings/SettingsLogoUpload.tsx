"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";
import { Camera, Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface SettingsLogoUploadProps {
  initialUrl?: string;
  onUpload: (url: string) => void;
}

export function SettingsLogoUpload({ initialUrl, onUpload }: SettingsLogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const data = await apiClient.upload<{ url: string }>("/settings/logo", formData);

      if (data.url) {
        setPreviewUrl(data.url);
        onUpload(data.url);
        toast.success("Logo uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload logo");
      // Revert preview if upload failed and we had an initial url
      setPreviewUrl(initialUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="relative group">
        {/* Logo Preview Container */}
        <div className="w-40 h-40 overflow-hidden bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center relative">
          {previewUrl ? (
            <div className="relative w-full h-full p-2">
              <Image src={previewUrl} alt="Store Logo" fill className="object-contain" unoptimized />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-xs">No Logo</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md pointer-events-none">
            <span className="text-white text-xs font-medium">Change Logo</span>
          </div>
        </div>

        {/* Upload Button overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors disabled:bg-gray-400 shadow-md z-10"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </button>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Recommended: 500x500px · Max 5MB</p>
        <p className="text-[10px] text-muted-foreground">Transparent PNG or JPG works best</p>
      </div>
    </div>
  );
}
