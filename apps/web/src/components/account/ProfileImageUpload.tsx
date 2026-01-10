"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

interface ProfileImageUploadProps {
  onImageUpdate?: (url: string) => void;
}

export function ProfileImageUpload({ onImageUpdate }: ProfileImageUploadProps) {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profileImage || null);

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

      const data = await apiClient.upload<{ profileImage: string }>("/users/profile/image", formData);

      // Update local state and user store
      if (data.profileImage) {
        setPreviewUrl(data.profileImage);
        setUser({ ...user, profileImage: data.profileImage });
        onImageUpdate?.(data.profileImage);
      }

      toast.success("Profile image updated!");
    } catch (error) {
      toast.error("Failed to upload image");
      // Revert preview
      setPreviewUrl(user?.profileImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={user?.name || "Profile"}
              width={96}
              height={96}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors disabled:bg-gray-400"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </button>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Click the camera icon to upload
        <br />
        Max 5MB (JPG, PNG, GIF)
      </p>
    </div>
  );
}
