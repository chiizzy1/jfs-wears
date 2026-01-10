import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PromotionType } from "@prisma/client";

export class CreatePromotionDto {
  @ApiProperty({ example: "SUMMER25" })
  @IsString()
  code: string;

  @ApiProperty({ example: "Summer Sale 25% Off" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: "Get 25% off on all summer items" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ["PERCENTAGE", "FIXED"] })
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty({ example: 25, description: "Discount value (percentage or fixed amount in Naira)" })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 5000, description: "Minimum order amount to apply promo" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 10000, description: "Maximum discount cap for percentage promos" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 100, description: "Maximum number of times this promo can be used" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiProperty({ example: "2026-01-01T00:00:00.000Z" })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: "2026-12-31T23:59:59.000Z" })
  @IsDateString()
  validTo: string;
}

export class UpdatePromotionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ValidatePromotionDto {
  @ApiProperty({ example: "SUMMER25" })
  @IsString()
  code: string;

  @ApiProperty({ example: 10000, description: "Cart subtotal to check eligibility" })
  @IsNumber()
  @Min(0)
  orderAmount: number;
}
