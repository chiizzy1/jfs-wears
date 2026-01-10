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

// Shipping address type for type-safe handling
export class ShippingAddressDto {
  @ApiProperty({ example: "John", description: "First name" })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: "Doe", description: "Last name" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: "john@example.com", description: "Email address" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "+2348012345678", description: "Phone number" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: "123 Admiralty Way", description: "Street address" })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: "Lekki", description: "City" })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: "Lagos", description: "State" })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({ example: "Near GTBank", description: "Landmark for delivery" })
  @IsString()
  @IsOptional()
  landmark?: string;
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

  @ApiProperty({ type: ShippingAddressDto, description: "Shipping address details" })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}
