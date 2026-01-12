import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateNotificationDto, NotificationQueryDto } from "./dto/notifications.dto";
import { NotificationType, Prisma } from "@prisma/client";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new notification
   */
  async create(data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        staffId: data.staffId,
        metadata: data.metadata as Prisma.JsonObject,
      },
    });
  }

  /**
   * Get all notifications with pagination
   * If staffId provided, returns notifications for that staff member + broadcasts
   */
  async findAll(query: NotificationQueryDto, staffId?: string) {
    const { unreadOnly, page = 1, limit = 20 } = query;

    const where: Prisma.NotificationWhereInput = {};

    // Filter by unread status
    if (unreadOnly) {
      where.isRead = false;
    }

    // Filter by staff: show notifications targeted to this staff OR broadcasts (null staffId)
    if (staffId) {
      where.OR = [
        { staffId: staffId },
        { staffId: null }, // Broadcasts
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get unread notification count for badge
   */
  async getUnreadCount(staffId?: string) {
    const where: Prisma.NotificationWhereInput = {
      isRead: false,
    };

    if (staffId) {
      where.OR = [{ staffId: staffId }, { staffId: null }];
    }

    return this.prisma.notification.count({ where });
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for a staff member
   */
  async markAllAsRead(staffId?: string) {
    const where: Prisma.NotificationWhereInput = {
      isRead: false,
    };

    if (staffId) {
      where.OR = [{ staffId: staffId }, { staffId: null }];
    }

    return this.prisma.notification.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // ========================================
  // Helper methods for creating notifications from events
  // ========================================

  /**
   * Create notification for new order
   */
  async notifyNewOrder(orderNumber: string, orderId: string, total: number) {
    return this.create({
      type: NotificationType.ORDER_NEW,
      title: "New Order Received",
      message: `Order ${orderNumber} for ₦${total.toLocaleString()} has been placed.`,
      link: `/admin/orders?id=${orderId}`,
      metadata: { orderId, orderNumber, total },
    });
  }

  /**
   * Create notification for new review
   */
  async notifyNewReview(productName: string, productId: string, rating: number, reviewId: string) {
    return this.create({
      type: NotificationType.REVIEW_NEW,
      title: "New Product Review",
      message: `New ${rating}-star review on "${productName}"`,
      link: `/admin/reviews`,
      metadata: { productId, productName, rating, reviewId },
    });
  }

  /**
   * Create notification for low stock
   */
  async notifyLowStock(productName: string, productId: string, variantInfo: string, currentStock: number) {
    return this.create({
      type: NotificationType.LOW_STOCK,
      title: "Low Stock Alert",
      message: `${productName} (${variantInfo}) is low on stock: ${currentStock} remaining`,
      link: `/admin/products/${productId}`,
      metadata: { productId, productName, variantInfo, currentStock },
    });
  }
}
