import { Injectable, NotFoundException, ConflictException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReviewDto, UpdateReviewDto } from "./dto/reviews.dto";
import { sanitizeText } from "../../common/utils/sanitize.util";
import { Prisma } from "@prisma/client";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, productId: string, data: CreateReviewDto) {
    // Check if user already reviewed this product
    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
    });

    if (existing) {
      throw new ConflictException("You have already reviewed this product");
    }

    // Check if user has purchased this product (Verified Purchase Enforcement)
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { in: ["DELIVERED", "SHIPPED", "CONFIRMED"] }, // Allow reviews for confirmed orders+
        },
      },
    });

    if (!hasPurchased) {
      throw new ForbiddenException("You can only review products you have purchased.");
    }

    // Sanitize user input to prevent XSS
    return this.prisma.review.create({
      data: {
        productId,
        userId,
        rating: data.rating,
        title: data.title ? sanitizeText(data.title) : undefined,
        comment: data.comment ? sanitizeText(data.comment) : undefined,
        isVerified: true, // Since we enforce purchase, this is always true
        isApproved: true, // Auto-approve by default, can be changed to false if moderation is needed
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async findByProduct(productId: string, params: { page: number; limit: number; sortBy: string; rating?: number }) {
    const { page, limit, sortBy, rating } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      productId,
      isApproved: true,
      ...(rating ? { rating } : {}),
    };

    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: "desc" };

    if (sortBy === "highest") orderBy = { rating: "desc" };
    if (sortBy === "lowest") orderBy = { rating: "asc" };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    // Calculate aggregated stats (global for the product, not just filtered)
    const allReviews = await this.prisma.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const stats = {
      count: allReviews.length,
      average: allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0,
      distribution: {
        5: allReviews.filter((r) => r.rating === 5).length,
        4: allReviews.filter((r) => r.rating === 4).length,
        3: allReviews.filter((r) => r.rating === 3).length,
        2: allReviews.filter((r) => r.rating === 2).length,
        1: allReviews.filter((r) => r.rating === 1).length,
      },
    };

    return {
      reviews,
      stats,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        product: { select: { id: true, name: true, slug: true, images: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(reviewId: string, userId: string, data: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new ConflictException("You can only edit your own reviews");
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        title: data.title ? sanitizeText(data.title) : undefined,
        comment: data.comment ? sanitizeText(data.comment) : undefined,
      },
    });
  }

  async delete(reviewId: string, userId: string, isAdmin = false) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (!isAdmin && review.userId !== userId) {
      throw new ConflictException("You can only delete your own reviews");
    }

    return this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

  // ============================================
  // ADMIN METHODS
  // ============================================

  async findAllAdmin(params: { page: number; limit: number; search?: string; status: string }) {
    const { page, limit, search, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (status === "pending") where.isApproved = false;
    if (status === "approved") where.isApproved = true;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { comment: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async toggleApproval(id: string, isApproved: boolean) {
    return this.prisma.review.update({
      where: { id },
      data: { isApproved },
    });
  }
}
