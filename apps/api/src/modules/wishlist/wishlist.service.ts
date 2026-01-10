import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { where: { isMain: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.basePrice),
      image: item.product.images[0]?.url || "",
      addedAt: item.createdAt,
    }));
  }

  async addToWishlist(userId: string, productId: string) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException("Product not found");

    // Check if already in wishlist
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new ConflictException("Product already in wishlist");

    const item = await this.prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          include: { images: { where: { isMain: true }, take: 1 } },
        },
      },
    });

    return {
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.basePrice),
      image: item.product.images[0]?.url || "",
      addedAt: item.createdAt,
    };
  }

  async removeFromWishlist(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) throw new NotFoundException("Item not in wishlist");

    await this.prisma.wishlistItem.delete({
      where: { id: item.id },
    });

    return { message: "Removed from wishlist" };
  }

  async clearWishlist(userId: string) {
    await this.prisma.wishlistItem.deleteMany({
      where: { userId },
    });
    return { message: "Wishlist cleared" };
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!item;
  }
}
