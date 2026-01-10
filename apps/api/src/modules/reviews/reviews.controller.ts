import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto, UpdateReviewDto } from "./dto/reviews.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Get reviews for a product (public)
  @Get("product/:productId")
  async getByProduct(@Param("productId") productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  // Create a review (authenticated)
  @Post("product/:productId")
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Param("productId") productId: string, @Body() createDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.sub, productId, createDto);
  }

  // Get user's reviews (authenticated)
  @Get("my")
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@Request() req: any) {
    return this.reviewsService.findByUser(req.user.sub);
  }

  // Update a review (authenticated)
  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async update(@Request() req: any, @Param("id") id: string, @Body() updateDto: UpdateReviewDto) {
    return this.reviewsService.update(id, req.user.sub, updateDto);
  }

  // Delete a review (authenticated)
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req: any, @Param("id") id: string) {
    return this.reviewsService.delete(id, req.user.sub);
  }
}
