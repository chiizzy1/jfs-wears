import { IsString, IsNumber, IsEmail, IsNotEmpty, IsEnum, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum PaymentProvider {
  OPAY = "OPAY",
  MONNIFY = "MONNIFY",
  PAYSTACK = "PAYSTACK",
}

export class InitializePaymentDto {
  @ApiProperty({ example: 5000, description: "Amount to pay in major units (e.g. Naira)" })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: "customer@example.com", description: "Customer email" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "order_12345", description: "Order ID to pay for" })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ enum: PaymentProvider, description: "Payment provider (OPAY, MONNIFY, PAYSTACK)" })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;
}
