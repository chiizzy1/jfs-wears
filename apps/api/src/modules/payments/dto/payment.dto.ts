import { IsString, IsNumber, IsEmail, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class InitializePaymentDto {
  @ApiProperty({ description: "Order ID to pay for" })
  @IsString()
  orderId: string;

  @ApiProperty({ description: "Customer email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Amount in Naira" })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: "URL to redirect after payment", required: false })
  @IsOptional()
  @IsString()
  callbackUrl?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: "Payment reference to verify" })
  @IsString()
  reference: string;
}
