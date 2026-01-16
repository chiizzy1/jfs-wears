import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com", description: "User email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123", description: "User password (min 6 chars)" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: "John Doe", description: "Full name" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: true, description: "Subscribe to newsletter" })
  @IsBoolean()
  @IsOptional()
  subscribe?: boolean;
}

export class LoginDto {
  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123", description: "User password" })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: "Refresh token string" })
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: "user@example.com", description: "Email to send reset link" })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: "Reset token from email link" })
  @IsString()
  token: string;

  @ApiProperty({ example: "newpassword123", description: "New password (min 6 chars)" })
  @IsString()
  @MinLength(6)
  password: string;
}
