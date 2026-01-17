"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, X, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { aiService, GeneratedProduct } from "@/services/ai.service";
import { cn } from "@/lib/utils";

interface AIProductGeneratorProps {
  imageUrl?: string;
  onApply: (generated: GeneratedProduct) => void;
  disabled?: boolean;
}

export function AIProductGenerator({ imageUrl, onApply, disabled }: AIProductGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [context, setContext] = useState("");
  const [generated, setGenerated] = useState<GeneratedProduct | null>(null);

  const handleGenerate = async () => {
    if (!imageUrl) {
      toast.error("Please upload a product image first");
      return;
    }

    setIsGenerating(true);
    setGenerated(null);

    try {
      const result = await aiService.generateFromImage({
        imageUrl,
        context: context.trim() || undefined,
      });
      setGenerated(result);
      toast.success(`Generated using ${result.provider}`);
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to generate. Check AI settings.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generated) {
      onApply(generated);
      setIsOpen(false);
      setGenerated(null);
      setContext("");
      toast.success("AI content applied to form!");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setGenerated(null);
    setContext("");
  };

  // Button to open the generator (shown in product form)
  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !imageUrl}
        onClick={() => setIsOpen(true)}
        className={cn("gap-2 rounded-none border-dashed", !imageUrl && "opacity-50 cursor-not-allowed")}
      >
        <Sparkles className="w-4 h-4" />
        Generate with AI
      </Button>
    );
  }

  // Expanded generator panel
  return (
    <div className="border border-violet-200 bg-linear-to-br from-violet-50 to-purple-50 p-6 space-y-4 relative">
      {/* Close button */}
      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={handleClose}>
        <X className="w-4 h-4" />
      </Button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center rounded-lg">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-medium">AI Product Generator</h3>
          <p className="text-sm text-muted-foreground">Analyze image and generate product details</p>
        </div>
      </div>

      {/* Context input */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Context (optional)</Label>
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., Premium owambe wear for young professionals, streetwear for Gen-Z..."
          className="resize-none h-20 rounded-none border-violet-200 focus-visible:ring-violet-500"
          disabled={isGenerating}
        />
        <p className="text-xs text-muted-foreground">Give AI hints about style, occasion, or target audience</p>
      </div>

      {/* Generate button */}
      {!generated && (
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full gap-2 rounded-none bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing image...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Product Details
            </>
          )}
        </Button>
      )}

      {/* Generated results */}
      {generated && (
        <div className="space-y-4 pt-2 border-t border-violet-200">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Generated successfully</span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Name</Label>
              <p className="font-medium mt-1">{generated.name}</p>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
              <p className="mt-1 text-muted-foreground line-clamp-3">{generated.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                <p className="mt-1">{generated.suggestedCategory || "Not specified"}</p>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Gender</Label>
                <p className="mt-1">{generated.gender}</p>
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {generated.tags.slice(0, 6).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-none"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              Regenerate
            </Button>
            <Button type="button" className="flex-1 rounded-none bg-green-600 hover:bg-green-700" onClick={handleApply}>
              Apply to Form
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
