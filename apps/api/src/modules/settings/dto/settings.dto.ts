import { IsString, IsEmail, IsBoolean, IsOptional, IsUrl, Matches, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

// AI Provider enum matching Prisma schema
export enum AiProvider {
  DISABLED = "DISABLED",
  GROQ = "GROQ",
  OPENROUTER = "OPENROUTER",
  GEMINI = "GEMINI",
}

export class UpdateSettingsDto {
  @ApiProperty({ example: "JFS Wears" })
  @IsString()
  @IsOptional()
  storeName?: string;

  @ApiProperty({ example: "contact@jfswears.com" })
  @IsEmail()
  @IsOptional()
  storeEmail?: string;

  @ApiProperty({ example: "NGN" })
  @IsString()
  @IsOptional()
  currency?: string;

  // Store Contact & Address (for receipts)
  @ApiProperty({ example: "+234 800 123 4567" })
  @IsString()
  @IsOptional()
  storePhone?: string;

  @ApiProperty({ example: "123 Fashion Street" })
  @IsString()
  @IsOptional()
  storeAddress?: string;

  @ApiProperty({ example: "Lagos" })
  @IsString()
  @IsOptional()
  storeCity?: string;

  @ApiProperty({ example: "Lagos State" })
  @IsString()
  @IsOptional()
  storeState?: string;

  @ApiProperty({ example: "100001" })
  @IsString()
  @IsOptional()
  storePostalCode?: string;

  @ApiProperty({ example: "Nigeria" })
  @IsString()
  @IsOptional()
  storeCountry?: string;

  // Receipt Branding
  @ApiProperty({ example: "https://res.cloudinary.com/xxx/logo.png" })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: "#000000", description: "HEX color for receipt headers" })
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "receiptAccentColor must be a valid HEX color" })
  @IsOptional()
  receiptAccentColor?: string;

  @ApiProperty({ example: "Thank you for shopping with us!" })
  @IsString()
  @IsOptional()
  receiptFooterText?: string;

  @ApiProperty({ example: "https://jfswears.com/returns" })
  @IsUrl()
  @IsOptional()
  returnPolicyUrl?: string;

  @ApiProperty({ example: "https://jfswears.com/terms" })
  @IsUrl()
  @IsOptional()
  termsUrl?: string;

  // Notifications
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  notifyOrder?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  notifyLowStock?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  notifyReview?: boolean;

  // AI Configuration - Primary Provider
  @ApiProperty({ example: "GROQ", enum: AiProvider })
  @IsEnum(AiProvider)
  @IsOptional()
  aiProvider?: AiProvider;

  @ApiProperty({ example: "gsk_xxxxx" })
  @IsString()
  @IsOptional()
  aiApiKey?: string;

  // AI Configuration - Fallback Provider
  @ApiProperty({ example: "GEMINI", enum: AiProvider })
  @IsEnum(AiProvider)
  @IsOptional()
  aiFallbackProvider?: AiProvider;

  @ApiProperty({ example: "AIzaSyxxxx" })
  @IsString()
  @IsOptional()
  aiFallbackApiKey?: string;
}
