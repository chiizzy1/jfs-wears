import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResendReceiptDto {
  @ApiProperty({ example: "customer@example.com", description: "Email to send receipt to" })
  @IsString()
  @IsOptional()
  email?: string;
}
