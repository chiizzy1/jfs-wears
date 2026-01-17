import { IsString, IsOptional, IsUrl, IsNumber, IsArray, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

// Vision Generation
export class GenerateFromImageDto {
  @ApiProperty({ example: "https://res.cloudinary.com/xxx/image/upload/v123/product.jpg" })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  context?: string;
}

export class TestConnectionDto {
  @ApiProperty({ example: "GROQ", enum: ["GROQ", "OPENROUTER", "GEMINI"] })
  @IsString()
  provider: string;

  @ApiProperty({ example: "gsk_xxx" })
  @IsString()
  apiKey: string;
}

// Blog Content
export class GenerateBlogDto {
  @ApiProperty({ example: "Top 10 Ankara Styles for 2026" })
  @IsString()
  topic: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  outline?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  existingDraft?: string;
}

// SEO Metadata
export class GenerateSeoDto {
  @ApiProperty({ example: "Premium Ankara Senator Set for..." })
  @IsString()
  content: string;

  @ApiProperty({ example: "product", enum: ["product", "blog", "category"] })
  @IsString()
  type: "product" | "blog" | "category";
}

// Hero Content
export class GenerateHeroDto {
  @ApiProperty({ example: "New Year Sale - 30% off everything" })
  @IsString()
  context: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  existingProducts?: string;
}

// Category Description
export class GenerateCategoryDescDto {
  @ApiProperty({ example: "Men's Traditional Wear" })
  @IsString()
  categoryName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  parentCategory?: string;
}

// Promotion Copy
export class GeneratePromotionCopyDto {
  @ApiProperty({ example: "PERCENTAGE", enum: ["PERCENTAGE", "FIXED"] })
  @IsString()
  type: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  value: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  context?: string;
}

// Order Response
export class GenerateOrderResponseDto {
  @ApiProperty({ example: "SHIPPED" })
  @IsString()
  orderStatus: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  customerName: string;

  @ApiProperty({ example: "JFS-2026-001234" })
  @IsString()
  orderNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  context?: string;
}

// Product Tags
export class SuggestTagsDto {
  @ApiProperty({ example: "Premium Ankara Senator Set" })
  @IsString()
  productName: string;

  @ApiProperty({ example: "Handcrafted traditional wear..." })
  @IsString()
  description: string;
}

// Dashboard Insights
export class DashboardInsightsDto {
  @ApiProperty({ example: 1500000 })
  @IsNumber()
  totalRevenue: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  orderCount: number;

  @ApiProperty({ example: ["Ankara Dress", "Senator Set"] })
  @IsArray()
  topProducts: string[];

  @ApiProperty({ example: ["Lace Fabric XL"] })
  @IsArray()
  lowStockItems: string[];
}

// Review Response
export class GenerateReviewResponseDto {
  @ApiProperty({ example: "Great quality, fast delivery!" })
  @IsString()
  reviewText: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  rating: number;

  @ApiProperty({ example: "Ankara Senator Set" })
  @IsString()
  productName: string;
}

// Inventory Prediction Item
class InventoryItem {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsNumber()
  currentStock: number;

  @IsNumber()
  avgDailySales: number;
}

export class PredictInventoryDto {
  @ApiProperty({ type: [InventoryItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryItem)
  salesData: InventoryItem[];
}
