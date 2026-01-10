import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReviewDto, UpdateReviewDto } from "./dto/reviews.dto";

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

    // Check if user has purchased this product (for verified badge)
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId },
      },
    });

    return this.prisma.review.create({
      data: {
        productId,
        userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        isVerified: !!hasPurchased,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async findByProduct(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId, isApproved: true },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const stats = {
      count: reviews.length,
      average: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
      distribution: {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
      },
    };

    return { reviews, stats };
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        product: { select: { id: true, name: true, slug: true } },
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
        title: data.title,
        comment: data.comment,
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
}
