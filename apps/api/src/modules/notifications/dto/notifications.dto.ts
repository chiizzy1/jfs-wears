import { IsOptional, IsEnum, IsInt, Min, IsBoolean, IsArray, IsString } from "class-validator";
import { Type } from "class-transformer";
import { NotificationType } from "@prisma/client";

/**
 * DTO for creating a notification
 */
export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  staffId?: string; // null = broadcast to all admins

  @IsOptional()
  metadata?: Record<string, unknown>;
}

/**
 * Query parameters for listing notifications
 */
export class NotificationQueryDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  unreadOnly?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}

/**
 * DTO for marking notifications as read
 */
export class MarkReadDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
