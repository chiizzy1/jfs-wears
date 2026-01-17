"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface AIGenerateButtonProps {
  onGenerate: () => Promise<void>;
  label?: string;
  disabled?: boolean;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "icon";
  className?: string;
}

export function AIGenerateButton({
  onGenerate,
  label = "Generate with AI",
  disabled = false,
  variant = "outline",
  size = "sm",
  className,
}: AIGenerateButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleClick = async () => {
    try {
      setGenerating(true);
      await onGenerate();
    } catch (error: any) {
      toast.error(error.message || "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled || generating}
      onClick={handleClick}
      className={cn("gap-1.5 text-xs", generating && "animate-pulse", className)}
    >
      {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
      {size !== "icon" && (generating ? "Generating..." : label)}
    </Button>
  );
}
