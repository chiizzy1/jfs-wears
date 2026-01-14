"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useAdminAuth } from "@/lib/admin-auth";
import { apiClient } from "@/lib/api-client";
import { Camera, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

export function AdminProfileImageUpload() {
  const { user, setUser } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch current profile image on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.get<{ profileImage?: string }>("/staff/me");
        if (data.profileImage) {
          setPreviewUrl(data.profileImage);
        }
      } catch {
        // Ignore - user may not have a profile image
      }
    };
    fetchProfile();
  }, []);

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

      const data = await apiClient.upload<{ profileImage: string }>("/staff/me/profile-image", formData);

      // Update preview with server URL and sync to global state
      if (data.profileImage) {
        setPreviewUrl(data.profileImage);
        // Update global admin auth context so navbar reflects the change
        if (user) {
          setUser({ ...user, profileImage: data.profileImage });
        }
      }

      toast.success("Profile image updated!");
    } catch (error) {
      toast.error("Failed to upload image");
      // Revert preview
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="relative">
        {/* Avatar - square to match admin design */}
        <div className="w-20 h-20 overflow-hidden bg-gray-100 border border-gray-200">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={user?.name || "Profile"}
              width={80}
              height={80}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black text-white">
              <span className="text-2xl font-medium">{user?.name?.[0]?.toUpperCase() || "A"}</span>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors disabled:bg-gray-400"
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        </button>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Click icon to upload · Max 5MB</p>
    </div>
  );
}
