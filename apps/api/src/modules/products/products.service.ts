import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
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
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const { categoryId, search, minPrice, maxPrice, gender, page = 1, limit = 12 } = query;

    const where: any = {
      isActive: true,
      deletedAt: null, // Filter out soft-deleted items
    };

    // Support filtering by category ID or slug
    if (categoryId) {
      // Check if it's a UUID (cuid) or a slug
      const isUuid =
        /^c[a-z0-9]{24,}$/i.test(categoryId) ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);

      if (isUuid) {
        where.categoryId = categoryId;
      } else {
        // It's a slug - find the category first
        const category = await this.prisma.category.findFirst({
          where: { slug: categoryId },
        });
        if (category) {
          where.categoryId = category.id;
        } else {
          // Category not found by slug - return empty results
          return { items: [], total: 0, page, limit, totalPages: 0 };
        }
      }
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

    if (query.isOnSale) {
      where.salePrice = { not: null };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: { where: { isActive: true }, include: { colorGroup: true } },
          images: { orderBy: { position: "asc" } },
          colorGroups: {
            orderBy: { position: "asc" },
            include: { images: { orderBy: { position: "asc" } } },
          },
          bulkPricingTiers: { orderBy: { minQuantity: "asc" } },
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
        variants: { where: { isActive: true }, include: { colorGroup: true } },
        images: { orderBy: { position: "asc" } },
        colorGroups: {
          orderBy: { position: "asc" },
          include: { images: { orderBy: { position: "asc" } } },
        },
        bulkPricingTiers: { orderBy: { minQuantity: "asc" } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { include: { colorGroup: true } },
        images: { orderBy: { position: "asc" } },
        colorGroups: {
          orderBy: { position: "asc" },
          include: { images: { orderBy: { position: "asc" } } },
        },
        bulkPricingTiers: { orderBy: { minQuantity: "asc" } },
      },
    });
  }

  async create(data: CreateProductDto) {
    const slug = slugify(data.name) + "-" + Date.now().toString().slice(-4);

    // Log incoming data for debugging
    this.logger.debug("Creating product with data:", JSON.stringify(data, null, 2));

    // Distribute variants if present
    const variantsData = data.variants?.map((v) => ({
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      priceAdjustment: v.priceAdjustment,
      isActive: true,
    }));

    // Convert date strings to Date objects for Prisma
    const saleStartDate = data.saleStartDate ? new Date(data.saleStartDate) : null;
    const saleEndDate = data.saleEndDate ? new Date(data.saleEndDate) : null;

    // Validate dates are valid
    if (saleStartDate && isNaN(saleStartDate.getTime())) {
      throw new HttpException("Invalid sale start date format", HttpStatus.BAD_REQUEST);
    }
    if (saleEndDate && isNaN(saleEndDate.getTime())) {
      throw new HttpException("Invalid sale end date format", HttpStatus.BAD_REQUEST);
    }

    return this.prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        isFeatured: data.isFeatured,
        gender: data.gender,
        bulkEnabled: data.bulkEnabled,
        salePrice: data.salePrice,
        saleStartDate,
        saleEndDate,
        variants: variantsData ? { create: variantsData } : undefined,
        bulkPricingTiers: data.bulkPricingTiers ? { create: data.bulkPricingTiers } : undefined,
      },
      include: {
        category: true,
        variants: { include: { colorGroup: true } },
        images: true,
        colorGroups: { include: { images: true } },
        bulkPricingTiers: true,
      },
    });
  }

  async update(id: string, data: UpdateProductDto) {
    const { variants, ...productData } = data;

    return this.prisma.$transaction(async (tx) => {
      // 1. Handle Variants if provided
      if (variants) {
        // Get existing variants
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
          select: { id: true },
        });
        const existingVariantIds = existingVariants.map((v) => v.id);

        // Identify variants to delete (those in DB but not in payload)
        const payloadVariantIds = variants.filter((v) => v.id).map((v) => v.id as string);
        const variantsToDelete = existingVariantIds.filter((id) => !payloadVariantIds.includes(id));

        if (variantsToDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: variantsToDelete } },
          });
        }

        // Handle Upserts (Update existing, Create new)
        for (const variant of variants) {
          if (variant.id) {
            // Update existing variant
            this.logger.debug(`Updating variant ${variant.id}: ${variant.size}/${variant.color}`);
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                size: variant.size,
                color: variant.color,
                sku: variant.sku,
                stock: variant.stock,
                priceAdjustment: variant.priceAdjustment,
                isActive: true,
              },
            });
          } else {
            // Create new variant - check for SKU collision first
            this.logger.debug(`Creating new variant: ${variant.size}/${variant.color} with SKU ${variant.sku}`);

            // Defensive check: ensure SKU doesn't already exist
            const existingBySku = await tx.productVariant.findUnique({
              where: { sku: variant.sku },
              select: { id: true, productId: true },
            });

            if (existingBySku) {
              this.logger.warn(`SKU collision detected: ${variant.sku} already exists for product ${existingBySku.productId}`);
              throw new HttpException(
                `SKU "${variant.sku}" already exists. Each variant must have a unique SKU.`,
                HttpStatus.CONFLICT
              );
            }

            await tx.productVariant.create({
              data: {
                productId: id,
                size: variant.size,
                color: variant.color,
                sku: variant.sku,
                stock: variant.stock,
                priceAdjustment: variant.priceAdjustment || 0,
                isActive: true,
              },
            });
          }
        }
      }

      // Convert date strings to Date objects for Prisma
      const saleStartDate = data.saleStartDate ? new Date(data.saleStartDate) : undefined;
      const saleEndDate = data.saleEndDate ? new Date(data.saleEndDate) : undefined;

      // 2. Update Product fields
      return tx.product.update({
        where: { id },
        data: {
          ...productData,
          salePrice: data.salePrice,
          saleStartDate: saleStartDate !== undefined ? saleStartDate : undefined,
          saleEndDate: saleEndDate !== undefined ? saleEndDate : undefined,
          bulkPricingTiers: data.bulkPricingTiers
            ? {
                deleteMany: {},
                create: data.bulkPricingTiers,
              }
            : undefined,
        },
        include: {
          category: true,
          variants: { include: { colorGroup: true } },
          images: true,
          colorGroups: { include: { images: true } },
          bulkPricingTiers: true,
        },
      });
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
        variants: { where: { isActive: true }, include: { colorGroup: true } },
        colorGroups: {
          orderBy: { position: "asc" },
          include: { images: { where: { isMain: true } } },
        },
      },
      take: limit,
    });
  }
}
