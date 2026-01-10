import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StaffRole } from "@prisma/client";

export class CreateStaffDto {
  @ApiProperty({ example: "john.doe@jfswears.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  name: string;

  @ApiProperty({ example: "SecurePassword123!" })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: StaffRole, default: StaffRole.STAFF })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;
}

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: "Jane Doe" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: StaffRole })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}
