import { adminAPI } from "@/lib/admin-api";

// ============================================
// TYPES
// ============================================

export interface GeneratedProduct {
  name: string;
  description: string;
  suggestedCategory: string;
  tags: string[];
  gender: "MEN" | "WOMEN" | "UNISEX";
  metaKeywords: string[];
  provider: string;
}

export interface BlogContent {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
}

export interface SeoMetadata {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
}

export interface PromotionCopy {
  name: string;
  description: string;
  marketingText: string;
}

export interface DashboardInsights {
  summary: string;
  trends: string[];
  recommendations: string[];
  opportunities: string[];
}

export interface InventoryPrediction {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDaysUntilLow: number;
  recommendation: string;
}

// ============================================
// AI SERVICE
// ============================================

export const aiService = {
  // Vision: Product from Image
  generateFromImage: async (data: { imageUrl: string; context?: string }): Promise<GeneratedProduct> => {
    return adminAPI.post<GeneratedProduct>("/admin/ai/generate-from-image", data);
  },

  // Test Connection
  testConnection: async (data: { provider: string; apiKey: string }): Promise<{ success: boolean; message: string }> => {
    return adminAPI.post<{ success: boolean; message: string }>("/admin/ai/test-connection", data);
  },

  // Blog Content
  generateBlog: async (data: { topic: string; outline?: string; existingDraft?: string }): Promise<BlogContent> => {
    return adminAPI.post<BlogContent>("/admin/ai/generate-blog", data);
  },

  // SEO Metadata
  generateSeo: async (data: { content: string; type: "product" | "blog" | "category" }): Promise<SeoMetadata> => {
    return adminAPI.post<SeoMetadata>("/admin/ai/generate-seo", data);
  },

  // Hero Headlines
  generateHero: async (data: { context: string; existingProducts?: string }): Promise<HeroContent> => {
    return adminAPI.post<HeroContent>("/admin/ai/generate-hero", data);
  },

  // Category Description
  generateCategoryDescription: async (data: {
    categoryName: string;
    parentCategory?: string;
  }): Promise<{ description: string }> => {
    return adminAPI.post<{ description: string }>("/admin/ai/generate-category-description", data);
  },

  // Promotion Copy
  generatePromotionCopy: async (data: { type: string; value: number; context?: string }): Promise<PromotionCopy> => {
    return adminAPI.post<PromotionCopy>("/admin/ai/generate-promotion-copy", data);
  },

  // Order Response
  generateOrderResponse: async (data: {
    orderStatus: string;
    customerName: string;
    orderNumber: string;
    context?: string;
  }): Promise<{ response: string }> => {
    return adminAPI.post<{ response: string }>("/admin/ai/generate-order-response", data);
  },

  // Product Tags
  suggestTags: async (data: { productName: string; description: string }): Promise<{ tags: string[] }> => {
    return adminAPI.post<{ tags: string[] }>("/admin/ai/suggest-tags", data);
  },

  // Dashboard Insights (V2)
  getDashboardInsights: async (data: {
    totalRevenue: number;
    orderCount: number;
    topProducts: string[];
    lowStockItems: string[];
  }): Promise<DashboardInsights> => {
    return adminAPI.post<DashboardInsights>("/admin/ai/dashboard-insights", data);
  },

  // Review Response (V2)
  generateReviewResponse: async (data: {
    reviewText: string;
    rating: number;
    productName: string;
  }): Promise<{ response: string }> => {
    return adminAPI.post<{ response: string }>("/admin/ai/review-response", data);
  },

  // Inventory Predictions (V2)
  predictInventory: async (data: {
    salesData: { productId: string; productName: string; currentStock: number; avgDailySales: number }[];
  }): Promise<{ predictions: InventoryPrediction[] }> => {
    return adminAPI.post<{ predictions: InventoryPrediction[] }>("/admin/ai/predict-inventory", data);
  },
};
