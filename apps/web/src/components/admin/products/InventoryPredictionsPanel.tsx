"use client";

import { useState } from "react";
import { Sparkles, Loader2, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService, InventoryPrediction } from "@/services/ai.service";
import toast from "react-hot-toast";
import { LowStockItem } from "@/types/admin.types";

interface InventoryPredictionsPanelProps {
  lowStockItems: LowStockItem[];
}

export function InventoryPredictionsPanel({ lowStockItems }: InventoryPredictionsPanelProps) {
  const [predictions, setPredictions] = useState<InventoryPrediction[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (lowStockItems.length === 0) {
      toast.error("No products available for prediction");
      return;
    }

    try {
      setIsGenerating(true);
      // Convert lowStockItems to salesData format
      const salesData = lowStockItems.slice(0, 10).map((item) => ({
        productId: item.productId,
        productName: item.productName,
        currentStock: item.stock,
        avgDailySales: Math.max(1, Math.round(item.stock / 30)), // Estimate based on current stock
      }));

      const result = await aiService.predictInventory({ salesData });
      setPredictions(result.predictions);
      toast.success("Predictions generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate predictions");
    } finally {
      setIsGenerating(false);
    }
  };

  const getUrgencyColor = (days: number) => {
    if (days < 7) return "border-red-200 bg-red-50";
    if (days < 30) return "border-amber-200 bg-amber-50";
    return "border-green-200 bg-green-50";
  };

  const getUrgencyIcon = (days: number) => {
    if (days < 7) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (days < 30) return <TrendingDown className="w-4 h-4 text-amber-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="bg-white border border-gray-100">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[0.15em] font-medium">AI Inventory Predictions</h2>
            <p className="text-xs text-muted-foreground">Stock depletion forecasts</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isGenerating || lowStockItems.length === 0}
          className="gap-2 rounded-none"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isGenerating ? "Analyzing..." : predictions ? "Refresh" : "Generate"}
        </Button>
      </div>

      <div className="p-6">
        {predictions ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {predictions.map((pred, i) => (
              <div key={i} className={`p-4 border ${getUrgencyColor(pred.predictedDaysUntilLow)}`}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm truncate flex-1">{pred.productName}</p>
                  {getUrgencyIcon(pred.predictedDaysUntilLow)}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span>Stock: {pred.currentStock}</span>
                  <span className="font-medium text-foreground">
                    {pred.predictedDaysUntilLow < 0 ? "Out of stock" : `~${pred.predictedDaysUntilLow} days`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{pred.recommendation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {lowStockItems.length === 0 ? "All products in healthy stock levels" : 'Click "Generate" to analyze inventory trends'}
          </p>
        )}
      </div>
    </div>
  );
}
