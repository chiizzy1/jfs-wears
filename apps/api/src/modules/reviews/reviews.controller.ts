import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query, Patch } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto, UpdateReviewDto } from "./dto/reviews.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/guards/roles.guard";
import { StaffRole } from "@prisma/client";
import { ApiTags, ApiQuery } from "@nestjs/swagger";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Get reviews for a product (public, paginated)
  @Get("product/:productId")
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "sortBy", required: false, type: String }) // 'newest', 'highest', 'lowest'
  @ApiQuery({ name: "rating", required: false, type: Number })
  async getByProduct(
    @Param("productId") productId: string,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("sortBy") sortBy = "newest",
    @Query("rating") rating?: number
  ) {
    return this.reviewsService.findByProduct(productId, {
      page: Number(page),
      limit: Number(limit),
      sortBy,
      rating: rating ? Number(rating) : undefined,
    });
  }

  // Create a review (authenticated, verified purchase only)
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

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  // Get all reviews (admin, paginated)
  @Get("admin/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "status", required: false, enum: ["all", "pending", "approved"] })
  async getAllReviews(
    @Query("page") page = 1,
    @Query("limit") limit = 20,
    @Query("search") search?: string,
    @Query("status") status = "all"
  ) {
    return this.reviewsService.findAllAdmin({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
    });
  }

  // Approve/Reject review
  @Patch("admin/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  async toggleStatus(@Param("id") id: string, @Body("isApproved") isApproved: boolean) {
    return this.reviewsService.toggleApproval(id, isApproved);
  }

  // Delete review (admin)
  @Delete("admin/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  async adminDelete(@Param("id") id: string) {
    // Admin delete typically works same as user delete but without user ownership check inside services if we pass a flag
    // Or we can call a specific admin delete method
    return this.reviewsService.delete(id, "", true);
  }
}
