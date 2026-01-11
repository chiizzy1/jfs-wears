import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, Min, MaxLength, IsUrl } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// ============================================
// ENUMS
// ============================================

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export enum SectionType {
  FEATURED = "FEATURED",
  CATEGORY = "CATEGORY",
  COLLECTION = "COLLECTION",
}

// ============================================
// HERO DTOs
// ============================================

export class CreateHeroDto {
  @ApiProperty({ description: "Main headline text" })
  @IsString()
  @MaxLength(200)
  headline: string;

  @ApiPropertyOptional({ description: "Subheadline/description" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subheadline?: string;

  @ApiPropertyOptional({ description: "CTA button text", default: "Shop Now" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ctaText?: string;

  @ApiPropertyOptional({ description: "CTA link (auto-generated if linked to product/category)" })
  @IsOptional()
  @IsString()
  ctaLink?: string;

  @ApiProperty({ description: "Media URL (Cloudinary)" })
  @IsString()
  mediaUrl: string;

  @ApiPropertyOptional({ enum: MediaType, default: MediaType.IMAGE })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiPropertyOptional({ description: "Thumbnail URL for video previews" })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: "Link to a specific product" })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: "Link to a specific category" })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Display order (lower = first)", default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({ description: "Is slide active?", default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHeroDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subheadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ctaText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// SECTION DTOs
// ============================================

export class CreateSectionDto {
  @ApiProperty({ description: "Section title (e.g., 'Latest Drops')" })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ description: "Section subtitle" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle?: string;

  @ApiProperty({ enum: SectionType, description: "Section type" })
  @IsEnum(SectionType)
  type: SectionType;

  @ApiPropertyOptional({ description: "Category ID (required if type is CATEGORY)" })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Custom media URL for section header" })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiPropertyOptional({ description: "Display order", default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({ description: "Is section active?", default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Max products to show", default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxProducts?: number;
}

export class UpdateSectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle?: string;

  @ApiPropertyOptional({ enum: SectionType })
  @IsOptional()
  @IsEnum(SectionType)
  type?: SectionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxProducts?: number;
}

// ============================================
// REORDER DTO
// ============================================

export class ReorderDto {
  @ApiProperty({ description: "Array of IDs in new order", type: [String] })
  @IsString({ each: true })
  ids: string[];
}
