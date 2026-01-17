import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import {
  AiService,
  GeneratedProduct,
  BlogContent,
  SeoMetadata,
  HeroContent,
  PromotionCopy,
  DashboardInsights,
  InventoryPrediction,
} from "./ai.service";
import {
  GenerateFromImageDto,
  TestConnectionDto,
  GenerateBlogDto,
  GenerateSeoDto,
  GenerateHeroDto,
  GenerateCategoryDescDto,
  GeneratePromotionCopyDto,
  GenerateOrderResponseDto,
  SuggestTagsDto,
  DashboardInsightsDto,
  GenerateReviewResponseDto,
  PredictInventoryDto,
} from "./dto/ai.dto";

@ApiTags("AI")
@Controller("admin/ai")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "MANAGER")
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ============================================
  // VISION: Product from Image
  // ============================================

  @Post("generate-from-image")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate product details from image using AI vision" })
  async generateFromImage(@Body() dto: GenerateFromImageDto): Promise<GeneratedProduct> {
    return this.aiService.generateFromImage(dto.imageUrl, dto.context);
  }

  @Post("test-connection")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Test connection to an AI provider" })
  async testConnection(@Body() dto: TestConnectionDto): Promise<{ success: boolean; message: string }> {
    return this.aiService.testConnection(dto.provider, dto.apiKey);
  }

  // ============================================
  // BLOG CONTENT
  // ============================================

  @Post("generate-blog")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate blog post from topic" })
  async generateBlog(@Body() dto: GenerateBlogDto): Promise<BlogContent> {
    return this.aiService.generateBlogPost(dto.topic, dto.outline, dto.existingDraft);
  }

  // ============================================
  // SEO METADATA
  // ============================================

  @Post("generate-seo")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate SEO metadata for content" })
  async generateSeo(@Body() dto: GenerateSeoDto): Promise<SeoMetadata> {
    return this.aiService.generateSeoMetadata(dto.content, dto.type);
  }

  // ============================================
  // HERO HEADLINES
  // ============================================

  @Post("generate-hero")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate hero section headlines" })
  async generateHero(@Body() dto: GenerateHeroDto): Promise<HeroContent> {
    return this.aiService.generateHeroContent(dto.context, dto.existingProducts);
  }

  // ============================================
  // CATEGORY DESCRIPTIONS
  // ============================================

  @Post("generate-category-description")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate category description" })
  async generateCategoryDescription(@Body() dto: GenerateCategoryDescDto): Promise<{ description: string }> {
    const description = await this.aiService.generateCategoryDescription(dto.categoryName, dto.parentCategory);
    return { description };
  }

  // ============================================
  // PROMOTION COPY
  // ============================================

  @Post("generate-promotion-copy")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate promotional copy" })
  async generatePromotionCopy(@Body() dto: GeneratePromotionCopyDto): Promise<PromotionCopy> {
    return this.aiService.generatePromotionCopy(dto.type, dto.value, dto.context);
  }

  // ============================================
  // ORDER RESPONSE
  // ============================================

  @Post("generate-order-response")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate customer order response email" })
  async generateOrderResponse(@Body() dto: GenerateOrderResponseDto): Promise<{ response: string }> {
    const response = await this.aiService.generateOrderResponse(dto.orderStatus, dto.customerName, dto.orderNumber, dto.context);
    return { response };
  }

  // ============================================
  // PRODUCT TAGS
  // ============================================

  @Post("suggest-tags")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Suggest product tags based on description" })
  async suggestTags(@Body() dto: SuggestTagsDto): Promise<{ tags: string[] }> {
    const tags = await this.aiService.suggestProductTags(dto.productName, dto.description);
    return { tags };
  }

  // ============================================
  // DASHBOARD INSIGHTS (V2)
  // ============================================

  @Post("dashboard-insights")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate AI insights from dashboard analytics" })
  async dashboardInsights(@Body() dto: DashboardInsightsDto): Promise<DashboardInsights> {
    return this.aiService.generateDashboardInsights({
      totalRevenue: dto.totalRevenue,
      orderCount: dto.orderCount,
      topProducts: dto.topProducts,
      lowStockItems: dto.lowStockItems,
    });
  }

  // ============================================
  // REVIEW RESPONSE (V2)
  // ============================================

  @Post("review-response")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate response to customer review" })
  async reviewResponse(@Body() dto: GenerateReviewResponseDto): Promise<{ response: string }> {
    const response = await this.aiService.generateReviewResponse(dto.reviewText, dto.rating, dto.productName);
    return { response };
  }

  // ============================================
  // INVENTORY PREDICTIONS (V2)
  // ============================================

  @Post("predict-inventory")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Predict inventory needs" })
  async predictInventory(@Body() dto: PredictInventoryDto): Promise<{ predictions: InventoryPrediction[] }> {
    const predictions = await this.aiService.predictInventory(dto.salesData);
    return { predictions };
  }
}
