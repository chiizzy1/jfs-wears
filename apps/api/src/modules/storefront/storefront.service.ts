import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateHeroDto, UpdateHeroDto, CreateSectionDto, UpdateSectionDto, ReorderDto, SectionType } from "./storefront.dto";

@Injectable()
export class StorefrontService {
  private readonly logger = new Logger(StorefrontService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // HERO SLIDES
  // ============================================

  async findAllHeroes(activeOnly = false) {
    const where = activeOnly ? { isActive: true } : {};
    return this.prisma.storefrontHero.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        product: {
          select: { id: true, name: true, slug: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async findHeroById(id: string) {
    const hero = await this.prisma.storefrontHero.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!hero) {
      throw new NotFoundException(`Hero slide with ID ${id} not found`);
    }

    return hero;
  }

  async createHero(dto: CreateHeroDto) {
    // Validate relations if provided
    if (dto.productId) {
      const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
      if (!product) throw new BadRequestException(`Product with ID ${dto.productId} not found`);
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException(`Category with ID ${dto.categoryId} not found`);
    }

    // Get next order value
    const maxOrder = await this.prisma.storefrontHero.aggregate({ _max: { order: true } });
    const nextOrder = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    const hero = await this.prisma.storefrontHero.create({
      data: {
        ...dto,
        order: nextOrder,
        mediaType: dto.mediaType ?? "IMAGE",
        isActive: dto.isActive ?? true,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    this.logger.log(`Created hero slide: ${hero.id}`);
    return hero;
  }

  async updateHero(id: string, dto: UpdateHeroDto) {
    await this.findHeroById(id); // Ensure exists

    // Validate relations if changing
    if (dto.productId) {
      const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
      if (!product) throw new BadRequestException(`Product with ID ${dto.productId} not found`);
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException(`Category with ID ${dto.categoryId} not found`);
    }

    const updated = await this.prisma.storefrontHero.update({
      where: { id },
      data: dto,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    this.logger.log(`Updated hero slide: ${id}`);
    return updated;
  }

  async deleteHero(id: string) {
    await this.findHeroById(id); // Ensure exists

    await this.prisma.storefrontHero.delete({ where: { id } });
    this.logger.log(`Deleted hero slide: ${id}`);

    return { message: "Hero slide deleted successfully" };
  }

  async reorderHeroes(dto: ReorderDto) {
    const updates = dto.ids.map((id, index) =>
      this.prisma.storefrontHero.update({
        where: { id },
        data: { order: index },
      })
    );

    await this.prisma.$transaction(updates);
    this.logger.log(`Reordered ${dto.ids.length} hero slides`);

    return { message: "Heroes reordered successfully" };
  }

  // ============================================
  // SECTIONS
  // ============================================

  async findAllSections(activeOnly = false) {
    const where = activeOnly ? { isActive: true } : {};
    return this.prisma.storefrontSection.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async findSectionById(id: string) {
    const section = await this.prisma.storefrontSection.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return section;
  }

  async createSection(dto: CreateSectionDto) {
    // Validate: CATEGORY type requires categoryId
    if (dto.type === SectionType.CATEGORY && !dto.categoryId) {
      throw new BadRequestException("Category ID is required for CATEGORY type sections");
    }

    // Validate category exists
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException(`Category with ID ${dto.categoryId} not found`);
    }

    // Get next order
    const maxOrder = await this.prisma.storefrontSection.aggregate({ _max: { order: true } });
    const nextOrder = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    const section = await this.prisma.storefrontSection.create({
      data: {
        ...dto,
        order: nextOrder,
        isActive: dto.isActive ?? true,
        maxProducts: dto.maxProducts ?? 10,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    this.logger.log(`Created section: ${section.id} (${section.title})`);
    return section;
  }

  async updateSection(id: string, dto: UpdateSectionDto) {
    const existing = await this.findSectionById(id);

    // Validate type change
    const newType = dto.type ?? existing.type;
    const newCategoryId = dto.categoryId ?? existing.categoryId;

    if (newType === SectionType.CATEGORY && !newCategoryId) {
      throw new BadRequestException("Category ID is required for CATEGORY type sections");
    }

    // Validate category exists if changing
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException(`Category with ID ${dto.categoryId} not found`);
    }

    const updated = await this.prisma.storefrontSection.update({
      where: { id },
      data: dto,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    this.logger.log(`Updated section: ${id}`);
    return updated;
  }

  async deleteSection(id: string) {
    await this.findSectionById(id);

    await this.prisma.storefrontSection.delete({ where: { id } });
    this.logger.log(`Deleted section: ${id}`);

    return { message: "Section deleted successfully" };
  }

  async reorderSections(dto: ReorderDto) {
    const updates = dto.ids.map((id, index) =>
      this.prisma.storefrontSection.update({
        where: { id },
        data: { order: index },
      })
    );

    await this.prisma.$transaction(updates);
    this.logger.log(`Reordered ${dto.ids.length} sections`);

    return { message: "Sections reordered successfully" };
  }

  // ============================================
  // PUBLIC: FULL STOREFRONT DATA
  // ============================================

  async getPublicStorefront() {
    const [heroSlides, sections] = await Promise.all([this.findAllHeroes(true), this.findAllSections(true)]);

    // Populate sections with products
    const populatedSections = await Promise.all(
      sections.map(async (section) => {
        let products: Array<{
          id: string;
          name: string;
          slug: string;
          basePrice: any;
          images: Array<{ url: string }>;
          category: { id: string; name: string; slug: string } | null;
        }> = [];

        if (section.type === "FEATURED") {
          products = await this.prisma.product.findMany({
            where: { isFeatured: true, isActive: true, deletedAt: null },
            take: section.maxProducts,
            orderBy: { createdAt: "desc" },
            include: {
              images: { where: { isMain: true }, take: 1 },
              category: { select: { id: true, name: true, slug: true } },
            },
          });
        } else if (section.type === "CATEGORY" && section.categoryId) {
          products = await this.prisma.product.findMany({
            where: { categoryId: section.categoryId, isActive: true, deletedAt: null },
            take: section.maxProducts,
            orderBy: { createdAt: "desc" },
            include: {
              images: { where: { isMain: true }, take: 1 },
              category: { select: { id: true, name: true, slug: true } },
            },
          });
        }

        return {
          ...section,
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            basePrice: p.basePrice,
            image: p.images[0]?.url ?? null,
            category: p.category,
          })),
        };
      })
    );

    // Generate CTA links for heroes if not custom
    const processedHeroes = heroSlides.map((hero) => ({
      ...hero,
      ctaLink:
        hero.ctaLink ||
        (hero.product ? `/products/${hero.product.slug}` : null) ||
        (hero.category ? `/shop?category=${hero.category.slug}` : null) ||
        "/shop",
    }));

    return {
      heroes: processedHeroes,
      sections: populatedSections,
    };
  }
}
