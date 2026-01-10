import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProductDto, UpdateProductDto, ProductQueryDto, CreateVariantDto } from "./dto/products.dto";
// Since we are in apps/api, and shared is a package, we might need to import from relative path or just reimplement slugify for now to be safe.
// Let's reimplement simple slugify here to avoid import issues until aliasing is verified.
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const { categoryId, search, minPrice, maxPrice, gender, page = 1, limit = 12 } = query;

    const where: any = {
      isActive: true,
      deletedAt: null, // Filter out soft-deleted items
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    if (gender) {
      where.gender = gender.toUpperCase();
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: { where: { isActive: true } },
          images: { orderBy: { position: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
        deletedAt: null,
      },
      include: {
        category: true,
        variants: { where: { isActive: true } },
        images: { orderBy: { position: "asc" } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { position: "asc" } },
      },
    });
  }

  async create(data: CreateProductDto) {
    const slug = slugify(data.name) + "-" + Date.now().toString().slice(-4);

    // Distribute variants if present
    const variantsData = data.variants?.map((v) => ({
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      priceAdjustment: v.priceAdjustment,
      isActive: true,
    }));

    return this.prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        gender: data.gender,
        variants: variantsData ? { create: variantsData } : undefined,
      },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });
  }

  async update(id: string, data: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async softDelete(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async restore(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }

  // Variant management
  async createVariant(productId: string, data: CreateVariantDto) {
    return this.prisma.productVariant.create({
      data: { productId, ...data },
    });
  }

  async updateVariantStock(variantId: string, stock: number) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });
  }

  // Image management
  async addImage(productId: string, url: string, isMain: boolean = false) {
    const position = await this.prisma.productImage.count({ where: { productId } });
    return this.prisma.productImage.create({
      data: { productId, url, position, isMain },
    });
  }

  async removeImage(imageId: string) {
    return this.prisma.productImage.delete({ where: { id: imageId } });
  }

  // Featured products
  async getFeatured(limit: number = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        images: { where: { isMain: true } },
        variants: { where: { isActive: true } },
      },
      take: limit,
    });
  }
}
