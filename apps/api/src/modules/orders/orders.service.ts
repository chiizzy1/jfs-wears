import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { OrderQueryDto, OrderStatus, CreateOrderDto } from "./dto/orders.dto";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { EmailService } from "../email/email.service";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private emailService: EmailService) {}

  async create(userId: string | null, data: CreateOrderDto) {
    const order = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let totalAmount = new Decimal(0);
      const orderItemsData = [];

      for (const item of data.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) {
          throw new NotFoundException(`Product variant not found: ${item.variantId}`);
        }

        if (variant.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${variant.product.name} (${variant.size}/${variant.color})`);
        }

        // Decrement stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: variant.stock - item.quantity },
        });

        const price = variant.product.basePrice.plus(variant.priceAdjustment ?? 0);
        totalAmount = totalAmount.plus(price.times(item.quantity));

        orderItemsData.push({
          variant: { connect: { id: item.variantId } },
          product: { connect: { id: variant.productId } },
          quantity: item.quantity,
          unitPrice: price,
          total: price.times(item.quantity),
          productName: variant.product.name,
          variantSize: variant.size,
          variantColor: variant.color,
        });
      }

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          user: userId ? { connect: { id: userId } } : undefined,
          status: OrderStatus.PENDING,
          totalAmount,
          currency: "NGN", // Default to NGN for now
          shippingZone: { connect: { id: data.shippingZoneId } },
          shippingAddress: data.shippingAddress as any,
          items: {
            create: orderItemsData,
          },
        } as any, // Bypass strict type check for complex union
        include: { items: true },
      });

      return createdOrder;
    });

    // Send order confirmation email (non-blocking)
    const email = (data.shippingAddress as any)?.email || (userId ? await this.getUserEmail(userId) : null);
    if (email) {
      this.emailService
        .sendOrderConfirmation(email, order.orderNumber, order.items as any[], Number((order as any).totalAmount))
        .catch((err) => console.error("Failed to send order confirmation:", err));
    }

    return order;
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.email || null;
  }

  async findAll(query: OrderQueryDto) {
    const { status, page = 1, limit = 20 } = query;

    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true, shippingZone: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true, shippingZone: true, user: true },
    });
  }

  async findByOrderNumber(orderNumber: string) {
    return this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true, shippingZone: true },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true, shippingZone: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: string, paymentReference?: string) {
    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus: paymentStatus as any, paymentReference },
    });
  }
}
