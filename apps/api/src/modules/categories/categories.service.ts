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
    data: Partial<{ name: string; slug: string; description: string; imageUrl: string; isActive: boolean; isFeatured: boolean }>
  ) {
    return this.prisma.category.update({ where: { id }, data });
  }

  /**
   * Toggle featured status for homepage "Shop by Category" grid
   * Validates max 3 featured categories and manages positions
   */
  async toggleFeatured(id: string, featured: boolean, position?: number) {
    if (featured) {
      // Check current featured count
      const featuredCount = await this.prisma.category.count({
        where: { isFeatured: true },
      });

      if (featuredCount >= 3) {
        throw new BadRequestException("Maximum 3 featured categories allowed. Please unfeature another category first.");
      }

      // If position specified, check if it's already taken
      if (position) {
        const existingAtPosition = await this.prisma.category.findFirst({
          where: { featuredPosition: position },
        });

        if (existingAtPosition && existingAtPosition.id !== id) {
          // Swap positions - clear the existing one
          await this.prisma.category.update({
            where: { id: existingAtPosition.id },
            data: { featuredPosition: null },
          });
        }
      }

      // Assign next available position if not specified
      if (!position) {
        const usedPositions = await this.prisma.category.findMany({
          where: { isFeatured: true, featuredPosition: { not: null } },
          select: { featuredPosition: true },
        });
        const used = usedPositions.map((p) => p.featuredPosition);
        position = [1, 2, 3].find((p) => !used.includes(p)) || 1;
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        isFeatured: featured,
        featuredPosition: featured ? position : null,
      },
    });
  }

  /**
   * Update just the featured position of a category
   */
  async updateFeaturedPosition(id: string, position: number) {
    // Validate position
    if (position < 1 || position > 3) {
      throw new BadRequestException("Position must be 1, 2, or 3");
    }

    // Check if category is featured
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category?.isFeatured) {
      throw new BadRequestException("Category must be featured first");
    }

    // Clear existing category at this position
    await this.prisma.category.updateMany({
      where: { featuredPosition: position, id: { not: id } },
      data: { featuredPosition: null },
    });

    return this.prisma.category.update({
      where: { id },
      data: { featuredPosition: position },
    });
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
