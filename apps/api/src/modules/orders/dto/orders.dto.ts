import { IsString, IsNumber, IsEmail, IsNotEmpty, IsEnum, Min, IsArray, ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export class OrderQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus, description: "Filter by order status" })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 1, description: "Page number" })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20, description: "Items per page" })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, description: "New status for the order" })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}

export class CreateOrderItemDto {
  @ApiProperty({ example: "variant_123", description: "ID of the product variant" })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 2, description: "Quantity to order" })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto], description: "List of items to order" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ example: "zone_lagos_island", description: "ID of the shipping zone" })
  @IsString()
  @IsNotEmpty()
  shippingZoneId: string;

  @ApiProperty({ example: "123 Admiralty Way, Lekki", description: "Full shipping address" })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}
