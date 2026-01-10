import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      ordersToday,
      ordersThisMonth,
      revenueToday,
      revenueThisMonth,
      revenueThisYear,
      ordersByStatus,
      topProducts,
    ] = await Promise.all([
      // Total products
      this.prisma.product.count({ where: { deletedAt: null, isActive: true } }),

      // Total orders
      this.prisma.order.count({ where: { deletedAt: null } }),

      // Total users
      this.prisma.user.count({ where: { deletedAt: null } }),

      // Orders today
      this.prisma.order.count({
        where: { createdAt: { gte: startOfToday }, deletedAt: null },
      }),

      // Orders this month
      this.prisma.order.count({
        where: { createdAt: { gte: startOfMonth }, deletedAt: null },
      }),

      // Revenue today
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfToday },
          status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
          deletedAt: null,
        },
      }),

      // Revenue this month
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfMonth },
          status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
          deletedAt: null,
        },
      }),

      // Revenue this year
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfYear },
          status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
          deletedAt: null,
        },
      }),

      // Orders by status
      this.prisma.order.groupBy({
        by: ["status"],
        _count: true,
        where: { deletedAt: null },
      }),

      // Top 5 products by order count
      this.prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    // Get product details for top products
    const topProductDetails = await Promise.all(
      topProducts.map(async (p) => {
        const product = await this.prisma.product.findUnique({
          where: { id: p.productId },
          select: { id: true, name: true, slug: true },
        });
        return {
          ...product,
          totalSold: p._sum.quantity || 0,
        };
      })
    );

    return {
      overview: {
        totalProducts,
        totalOrders,
        totalUsers,
        ordersToday,
        ordersThisMonth,
      },
      revenue: {
        today: Number(revenueToday._sum.total || 0),
        thisMonth: Number(revenueThisMonth._sum.total || 0),
        thisYear: Number(revenueThisYear._sum.total || 0),
      },
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      topProducts: topProductDetails,
    };
  }

  async getRevenueByPeriod(period: "day" | "week" | "month" = "month") {
    const now = new Date();
    let startDate: Date;
    let groupFormat: string;

    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        break;
      case "week":
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), 0, 1); // This year
        break;
    }

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
        deletedAt: null,
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const grouped = orders.reduce((acc, order) => {
      const dateKey =
        period === "month"
          ? `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`
          : order.createdAt.toISOString().split("T")[0];

      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += Number(order.total);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  async getLowStockProducts(threshold = 10) {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        stock: { lte: threshold },
        deletedAt: null,
        product: { deletedAt: null, isActive: true },
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { stock: "asc" },
      take: 20,
    });

    return variants.map((v) => ({
      productId: v.product.id,
      productName: v.product.name,
      variantId: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
    }));
  }
}
