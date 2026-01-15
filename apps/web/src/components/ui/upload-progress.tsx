"use client";

import { cn } from "@/lib/utils";

interface UploadProgressProps {
  progress: number;
  previewUrl?: string;
  isVideo?: boolean;
  status?: string;
  className?: string;
}

export function UploadProgress({
  progress,
  previewUrl,
  isVideo = false,
  status = "Uploading...",
  className,
}: UploadProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preview Area */}
      <div className="relative w-full h-32 bg-gray-100 overflow-hidden flex items-center justify-center">
        {previewUrl ? (
          <>
            {isVideo ? (
              <video src={previewUrl} className="h-full w-full object-cover opacity-60" muted />
            ) : (
              <img src={previewUrl} alt="Upload preview" className="h-full w-full object-cover opacity-60" />
            )}
            {/* Progress overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="text-white font-bold text-2xl drop-shadow-lg">{clampedProgress}%</div>
            </div>
          </>
        ) : (
          <div className="text-4xl font-bold text-gray-300">{clampedProgress}%</div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 overflow-hidden">
        <div className="h-full bg-black transition-all duration-300 ease-out" style={{ width: `${clampedProgress}%` }} />
      </div>

      {/* Status Text */}
      <p className="text-sm text-gray-500 text-center">{status}</p>
    </div>
  );
}
