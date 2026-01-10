import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { OrderQueryDto, OrderStatus, CreateOrderDto, ShippingAddressDto } from "./dto/orders.dto";
import { SettingsService } from "../settings/settings.service";
import { Prisma, PaymentStatus as PrismaPaymentStatus, OrderStatus as PrismaOrderStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { EmailService } from "../email/email.service";
import { sanitizeText } from "../../common/utils/sanitize.util";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private emailService: EmailService, private settingsService: SettingsService) {}

  async create(userId: string | null, data: CreateOrderDto) {
    // Generate order number: JFS-YYYYMMDD-XXXXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNumber = `JFS-${dateStr}-${randomPart}`;

    const order = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let totalAmount = new Decimal(0);
      const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

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

      // Sanitize shipping address fields
      const sanitizedAddress: ShippingAddressDto = {
        firstName: sanitizeText(data.shippingAddress.firstName),
        lastName: sanitizeText(data.shippingAddress.lastName),
        email: data.shippingAddress.email.toLowerCase().trim(),
        phone: sanitizeText(data.shippingAddress.phone),
        address: sanitizeText(data.shippingAddress.address),
        city: sanitizeText(data.shippingAddress.city),
        state: sanitizeText(data.shippingAddress.state),
        landmark: data.shippingAddress.landmark ? sanitizeText(data.shippingAddress.landmark) : undefined,
      };

      // Create Order with proper typing
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          user: userId ? { connect: { id: userId } } : undefined,
          status: PrismaOrderStatus.PENDING,
          subtotal: totalAmount,
          shippingFee: 0, // Will be calculated based on shipping zone
          total: totalAmount, // TODO: Add shipping fee to total
          paymentMethod: "BANK_TRANSFER", // Default, will be set during checkout
          shippingZone: { connect: { id: data.shippingZoneId } },
          shippingAddress: sanitizedAddress as unknown as Prisma.JsonObject,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      return createdOrder;
    });

    // Type assertion for the order with items (Prisma transaction doesn't preserve include types)
    const typedOrder = order as typeof order & {
      items: Array<{ id: string; productName: string }>;
      total: number;
    };

    // Send order confirmation email (non-blocking)
    const email = data.shippingAddress.email || (userId ? await this.getUserEmail(userId) : null);
    if (email) {
      this.emailService
        .sendOrderConfirmation(email, typedOrder.orderNumber, typedOrder.items, Number(typedOrder.total))
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

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status as PrismaOrderStatus;

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

  async updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status: status as PrismaOrderStatus },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED", paymentReference?: string) {
    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus: paymentStatus as PrismaPaymentStatus, paymentReference },
    });
  }
}
