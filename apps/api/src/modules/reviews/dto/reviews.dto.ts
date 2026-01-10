import { IsInt, IsString, IsOptional, Min, Max } from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateReviewDto {
  @ApiProperty({ example: 5, description: "Rating from 1-5" })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: "Great quality!", required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: "The fabric is amazing and fits perfectly.", required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
