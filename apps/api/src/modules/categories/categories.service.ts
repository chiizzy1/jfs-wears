import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { position: "asc" },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { position: "asc" },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: { children: true },
    });
  }

  async create(data: { name: string; slug: string; description?: string; imageUrl?: string; parentId?: string }) {
    return this.prisma.category.create({ data });
  }

  async update(
    id: string,
    data: Partial<{ name: string; slug: string; description: string; imageUrl: string; isActive: boolean }>
  ) {
    return this.prisma.category.update({ where: { id }, data });
  }

  /**
   * Delete a category - only allowed if no products are assigned.
   * This prevents orphaned products and maintains data integrity.
   *
   * Options for categories with products:
   * 1. Reassign products to another category first
   * 2. Delete all products in the category first
   * 3. Use soft-delete (set isActive: false) instead
   */
  async delete(id: string) {
    // Check if category has any products
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category: ${productCount} product(s) are still assigned to it. ` +
          `Please reassign or delete these products first.`
      );
    }

    // Check for child categories
    const childCount = await this.prisma.category.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      throw new BadRequestException(
        `Cannot delete category: ${childCount} child category(ies) exist. ` + `Please delete or reassign child categories first.`
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }

  /**
   * Soft delete - safer alternative that preserves data
   */
  async softDelete(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get product count for a category - useful for UI display
   */
  async getProductCount(id: string): Promise<number> {
    return this.prisma.product.count({ where: { categoryId: id } });
  }
}
