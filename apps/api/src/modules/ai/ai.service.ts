import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import OpenAI from "openai";

// Types
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

interface ProviderConfig {
  baseURL: string;
  model: string;
  textModel?: string;
}

// Provider configurations
const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  GROQ: {
    baseURL: "https://api.groq.com/openai/v1",
    model: "llama-3.2-90b-vision-preview",
    textModel: "llama-3.3-70b-versatile",
  },
  OPENROUTER: {
    baseURL: "https://openrouter.ai/api/v1",
    model: "google/gemini-2.0-flash-exp:free",
    textModel: "google/gemini-2.0-flash-exp:free",
  },
  GEMINI: {
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.0-flash",
    textModel: "gemini-2.0-flash",
  },
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // CORE: Provider & Settings
  // ============================================

  private async getProviderSettings() {
    const settings = await this.prisma.storeSettings.findFirst();
    if (!settings?.aiProvider || settings.aiProvider === "DISABLED") {
      throw new HttpException("AI is disabled. Configure a provider in Settings.", HttpStatus.BAD_REQUEST);
    }
    return settings;
  }

  private async callTextApi<T>(systemPrompt: string, userPrompt: string, parseJson = true): Promise<T> {
    const settings = await this.getProviderSettings();

    try {
      return await this.executeTextCall<T>(settings.aiProvider, settings.aiApiKey!, systemPrompt, userPrompt, parseJson);
    } catch (primaryError) {
      this.logger.warn(`Primary provider ${settings.aiProvider} failed: ${primaryError}`);

      if (settings.aiFallbackProvider && settings.aiFallbackProvider !== "DISABLED" && settings.aiFallbackApiKey) {
        try {
          return await this.executeTextCall<T>(
            settings.aiFallbackProvider,
            settings.aiFallbackApiKey,
            systemPrompt,
            userPrompt,
            parseJson,
          );
        } catch (fallbackError) {
          this.logger.error(`Fallback also failed: ${fallbackError}`);
          throw new HttpException("Both AI providers failed.", HttpStatus.SERVICE_UNAVAILABLE);
        }
      }
      throw new HttpException("AI provider failed.", HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  private async executeTextCall<T>(
    provider: string,
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    parseJson: boolean,
  ): Promise<T> {
    const config = PROVIDER_CONFIGS[provider];
    if (!config) throw new Error(`Unknown provider: ${provider}`);

    const client = new OpenAI({ apiKey, baseURL: config.baseURL });

    const response = await client.chat.completions.create({
      model: config.textModel || config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    if (!parseJson) return content as T;

    // Parse JSON, handle markdown code blocks
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    return JSON.parse(jsonStr);
  }

  // ============================================
  // VISION: Product from Image
  // ============================================

  async generateFromImage(imageUrl: string, context?: string): Promise<GeneratedProduct> {
    const settings = await this.getProviderSettings();
    const categories = await this.prisma.category.findMany({ where: { isActive: true }, select: { name: true } });
    const categoryNames = categories.map((c) => c.name).join(", ");

    const systemPrompt = `You are an expert Nigerian fashion e-commerce copywriter. Respond in valid JSON:
{
  "name": "Product name",
  "description": "150-word description for owambe, wedding, casual occasions",
  "suggestedCategory": "One of: ${categoryNames}",
  "tags": ["array", "of", "tags"],
  "gender": "MEN" or "WOMEN" or "UNISEX",
  "metaKeywords": ["SEO", "keywords"]
}`;

    const userPrompt = context ? `Analyze this product image.\nContext: ${context}` : "Analyze this product image.";

    try {
      return await this.callVisionApi(settings.aiProvider, settings.aiApiKey!, imageUrl, systemPrompt, userPrompt);
    } catch (primaryError) {
      if (settings.aiFallbackProvider && settings.aiFallbackProvider !== "DISABLED" && settings.aiFallbackApiKey) {
        return await this.callVisionApi(
          settings.aiFallbackProvider,
          settings.aiFallbackApiKey,
          imageUrl,
          systemPrompt,
          userPrompt,
        );
      }
      throw primaryError;
    }
  }

  private async callVisionApi(
    provider: string,
    apiKey: string,
    imageUrl: string,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<GeneratedProduct> {
    const config = PROVIDER_CONFIGS[provider];
    const client = new OpenAI({ apiKey, baseURL: config.baseURL });

    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    const parsed = JSON.parse(jsonStr);
    return {
      name: parsed.name || "Untitled",
      description: parsed.description || "",
      suggestedCategory: parsed.suggestedCategory || "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      gender: ["MEN", "WOMEN", "UNISEX"].includes(parsed.gender) ? parsed.gender : "UNISEX",
      metaKeywords: Array.isArray(parsed.metaKeywords) ? parsed.metaKeywords : [],
      provider,
    };
  }

  async testConnection(provider: string, apiKey: string): Promise<{ success: boolean; message: string }> {
    const config = PROVIDER_CONFIGS[provider];
    if (!config) return { success: false, message: `Unknown provider: ${provider}` };

    try {
      const client = new OpenAI({ apiKey, baseURL: config.baseURL });
      await client.models.list();
      return { success: true, message: `Connected to ${provider} successfully` };
    } catch (error: any) {
      return { success: false, message: error.message || "Connection failed" };
    }
  }

  // ============================================
  // BLOG CONTENT
  // ============================================

  async generateBlogPost(topic: string, outline?: string, existingDraft?: string): Promise<BlogContent> {
    const systemPrompt = `You are an expert content writer for JFS Wears, a Nigerian fashion brand. Write engaging, SEO-optimized blog posts.
Return valid JSON:
{
  "title": "Compelling blog title (50-60 chars)",
  "excerpt": "Engaging excerpt (150-160 chars)",
  "content": "Full HTML blog post (800-1200 words, use <h2>, <p>, <ul> tags)",
  "tags": ["relevant", "tags"],
  "metaTitle": "SEO title (50-60 chars)",
  "metaDescription": "Meta description (150-155 chars)"
}`;

    let userPrompt = `Write a blog post about: ${topic}`;
    if (outline) userPrompt += `\n\nOutline:\n${outline}`;
    if (existingDraft) userPrompt += `\n\nImprove this draft:\n${existingDraft}`;

    return this.callTextApi<BlogContent>(systemPrompt, userPrompt);
  }

  // ============================================
  // SEO METADATA
  // ============================================

  async generateSeoMetadata(content: string, type: "product" | "blog" | "category"): Promise<SeoMetadata> {
    const systemPrompt = `You are an SEO expert. Generate optimized metadata for ${type} content.
Return valid JSON:
{
  "metaTitle": "Compelling title (50-60 chars, include main keyword)",
  "metaDescription": "Action-oriented description (150-155 chars)",
  "keywords": ["5-8", "relevant", "keywords"]
}`;

    return this.callTextApi<SeoMetadata>(systemPrompt, `Generate SEO metadata for:\n${content.substring(0, 1000)}`);
  }

  // ============================================
  // HERO HEADLINES
  // ============================================

  async generateHeroContent(context: string, existingProducts?: string): Promise<HeroContent> {
    const systemPrompt = `You are a creative copywriter for JFS Wears Nigerian fashion. Write punchy hero section copy.
Return valid JSON:
{
  "headline": "Bold, attention-grabbing headline (5-8 words)",
  "subheadline": "Supporting text explaining value proposition (10-15 words)",
  "ctaText": "Action button text (2-4 words like 'Shop Now', 'Explore Collection')"
}`;

    let userPrompt = `Create hero section copy for: ${context}`;
    if (existingProducts) userPrompt += `\nFeatured products: ${existingProducts}`;

    return this.callTextApi<HeroContent>(systemPrompt, userPrompt);
  }

  // ============================================
  // CATEGORY DESCRIPTIONS
  // ============================================

  async generateCategoryDescription(categoryName: string, parentCategory?: string): Promise<string> {
    const systemPrompt = `You are an SEO copywriter for JFS Wears Nigerian fashion store. Write compelling category descriptions that help customers and improve SEO. Keep it concise (2-3 sentences, 50-80 words).`;

    let userPrompt = `Write a category description for: ${categoryName}`;
    if (parentCategory) userPrompt += ` (subcategory of ${parentCategory})`;

    return this.callTextApi<string>(systemPrompt, userPrompt, false);
  }

  // ============================================
  // PROMOTION COPY
  // ============================================

  async generatePromotionCopy(type: string, value: number, context?: string): Promise<PromotionCopy> {
    const systemPrompt = `You are a marketing copywriter for JFS Wears. Create exciting promotional copy.
Return valid JSON:
{
  "name": "Catchy promo name (e.g., 'Flash Friday Sale')",
  "description": "Brief internal description",
  "marketingText": "Customer-facing promotional text (1-2 sentences)"
}`;

    let userPrompt = `Create promo copy for: ${type} discount of ${value}${type === "PERCENTAGE" ? "%" : " NGN"}`;
    if (context) userPrompt += `\nContext: ${context}`;

    return this.callTextApi<PromotionCopy>(systemPrompt, userPrompt);
  }

  // ============================================
  // ORDER RESPONSE TEMPLATES
  // ============================================

  async generateOrderResponse(orderStatus: string, customerName: string, orderNumber: string, context?: string): Promise<string> {
    const systemPrompt = `You are a customer service representative for JFS Wears. Write professional, warm, and helpful email responses. Be concise but friendly. Include the order number. Do not use placeholder brackets - write complete text.`;

    let userPrompt = `Write an email for order #${orderNumber} to ${customerName}.
Status: ${orderStatus}`;
    if (context) userPrompt += `\nAdditional context: ${context}`;

    return this.callTextApi<string>(systemPrompt, userPrompt, false);
  }

  // ============================================
  // PRODUCT TAGS
  // ============================================

  async suggestProductTags(productName: string, description: string): Promise<string[]> {
    const systemPrompt = `You are a Nigerian fashion e-commerce tagging expert. Suggest relevant product tags for search and filtering.
Return valid JSON array of 5-10 tags: ["tag1", "tag2", ...]
Include: style, occasion (owambe, wedding, casual), fabric type, season, trend keywords.`;

    return this.callTextApi<string[]>(systemPrompt, `Product: ${productName}\nDescription: ${description}`);
  }

  // ============================================
  // DASHBOARD INSIGHTS (V2)
  // ============================================

  async generateDashboardInsights(analyticsData: {
    totalRevenue: number;
    orderCount: number;
    topProducts: string[];
    lowStockItems: string[];
  }): Promise<DashboardInsights> {
    const systemPrompt = `You are a retail analytics expert. Analyze sales data and provide actionable insights.
Return valid JSON:
{
  "summary": "One-line summary of overall performance",
  "trends": ["3-5 observed trends"],
  "recommendations": ["3-5 actionable recommendations"],
  "opportunities": ["2-3 growth opportunities"]
}`;

    return this.callTextApi<DashboardInsights>(systemPrompt, `Analyze this data:\n${JSON.stringify(analyticsData, null, 2)}`);
  }

  // ============================================
  // REVIEW RESPONSES (V2)
  // ============================================

  async generateReviewResponse(reviewText: string, rating: number, productName: string): Promise<string> {
    const tone =
      rating >= 4 ? "grateful and encouraging" : rating >= 3 ? "appreciative and helpful" : "empathetic and solution-oriented";

    const systemPrompt = `You are a customer service representative for JFS Wears. Write a ${tone} response to a customer review. Keep it professional, personal, and concise (2-3 sentences).`;

    return this.callTextApi<string>(systemPrompt, `Product: ${productName}\nRating: ${rating}/5\nReview: ${reviewText}`, false);
  }

  // ============================================
  // INVENTORY PREDICTIONS (V2)
  // ============================================

  async predictInventory(
    salesData: { productId: string; productName: string; currentStock: number; avgDailySales: number }[],
  ): Promise<InventoryPrediction[]> {
    const systemPrompt = `You are an inventory management AI. Analyze stock levels and predict when items will run low.
Return valid JSON array:
[{
  "productId": "id",
  "productName": "name",
  "currentStock": number,
  "predictedDaysUntilLow": number,
  "recommendation": "Reorder now / Monitor / Adequate stock"
}]`;

    return this.callTextApi<InventoryPrediction[]>(
      systemPrompt,
      `Predict inventory needs:\n${JSON.stringify(salesData, null, 2)}`,
    );
  }
}
