import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePromotionDto, UpdatePromotionDto, ValidatePromotionDto } from "./dto/promotions.dto";

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    return this.prisma.promotion.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const promo = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promo) {
      throw new NotFoundException("Promotion not found");
    }
    return promo;
  }

  async findByCode(code: string) {
    const promo = await this.prisma.promotion.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!promo) {
      throw new NotFoundException("Promotion code not found");
    }
    return promo;
  }

  async create(dto: CreatePromotionDto) {
    const existing = await this.prisma.promotion.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException("Promotion code already exists");
    }

    return this.prisma.promotion.create({
      data: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        description: dto.description,
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount,
        maxDiscount: dto.maxDiscount,
        usageLimit: dto.usageLimit,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
      },
    });
  }

  async update(id: string, dto: UpdatePromotionDto) {
    await this.findOne(id);

    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...dto,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validTo: dto.validTo ? new Date(dto.validTo) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.promotion.delete({ where: { id } });
  }

  async validate(dto: ValidatePromotionDto) {
    const promo = await this.findByCode(dto.code);
    const now = new Date();

    // Check if active
    if (!promo.isActive) {
      throw new BadRequestException("This promotion is no longer active");
    }

    // Check validity period
    if (now < promo.validFrom || now > promo.validTo) {
      throw new BadRequestException("This promotion has expired or is not yet valid");
    }

    // Check usage limit
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      throw new BadRequestException("This promotion has reached its usage limit");
    }

    // Check minimum order amount
    if (promo.minOrderAmount && dto.orderAmount < Number(promo.minOrderAmount)) {
      throw new BadRequestException(`Minimum order amount of ₦${promo.minOrderAmount} required for this promotion`);
    }

    // Calculate discount
    let discount = 0;
    if (promo.type === "PERCENTAGE") {
      discount = (dto.orderAmount * Number(promo.value)) / 100;
      // Apply max discount cap if set
      if (promo.maxDiscount && discount > Number(promo.maxDiscount)) {
        discount = Number(promo.maxDiscount);
      }
    } else {
      // FIXED amount
      discount = Number(promo.value);
    }

    return {
      valid: true,
      code: promo.code,
      name: promo.name,
      type: promo.type,
      discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
      message: `Promotion "${promo.name}" applied successfully`,
    };
  }

  async incrementUsage(id: string) {
    return this.prisma.promotion.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  }
}
