"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, X, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { aiService } from "@/services/ai.service";
import toast from "react-hot-toast";
import { Review } from "@/hooks/use-reviews";

interface ReviewResponseDialogProps {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewResponseDialog({ review, open, onOpenChange }: ReviewResponseDialogProps) {
  const [response, setResponse] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!review) return;
    try {
      setIsGenerating(true);
      const result = await aiService.generateReviewResponse({
        reviewText: review.comment || review.title || "",
        rating: review.rating,
        productName: review.product?.name || "product",
      });
      setResponse(result.response);
      toast.success("Response generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate response");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setResponse("");
    onOpenChange(false);
  };

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-violet-600" />
            AI Reply Suggestion
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Review Summary */}
          <div className="bg-gray-50 p-4 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Original Review</span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-3">{review.comment || review.title || "No comment"}</p>
            <p className="text-xs text-muted-foreground">
              By {review.user?.name || "Anonymous"} • {review.product?.name}
            </p>
          </div>

          {/* Generate Button */}
          {!response && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 rounded-none bg-linear-to-r from-violet-600 to-purple-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating response...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Response
                </>
              )}
            </Button>
          )}

          {/* Generated Response */}
          {response && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Suggested Reply</span>
                <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isGenerating} className="h-7 text-xs gap-1">
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Regenerate
                </Button>
              </div>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={5}
                className="rounded-none text-sm"
              />
              <Button onClick={handleCopy} variant="outline" className="w-full gap-2 rounded-none">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
