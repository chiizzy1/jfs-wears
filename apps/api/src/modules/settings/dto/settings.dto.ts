import { IsString, IsEmail, IsBoolean, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
}
