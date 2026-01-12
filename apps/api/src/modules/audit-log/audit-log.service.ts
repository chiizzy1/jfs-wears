import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditAction } from "@prisma/client";

export interface LogAuditParams {
  staffId?: string;
  staffEmail?: string;
  staffName?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log an audit event
   */
  async log(params: LogAuditParams) {
    return this.prisma.auditLog.create({
      data: {
        staffId: params.staffId,
        staffEmail: params.staffEmail,
        staffName: params.staffName,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        description: params.description,
        metadata: params.metadata,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  /**
   * Helper to log from request context
   */
  async logFromRequest(
    req: any,
    action: AuditAction,
    entity: string,
    entityId: string | undefined,
    description: string,
    metadata?: Record<string, any>
  ) {
    const staffId = req.user?.sub;
    const staffEmail = req.user?.email;

    // Get staff name if available
    let staffName: string | undefined;
    if (staffId) {
      const staff = await this.prisma.staff.findUnique({
        where: { id: staffId },
        select: { name: true },
      });
      staffName = staff?.name;
    }

    return this.log({
      staffId,
      staffEmail,
      staffName,
      action,
      entity,
      entityId,
      description,
      metadata,
      ipAddress: req.ip || req.headers?.["x-forwarded-for"],
      userAgent: req.headers?.["user-agent"],
    });
  }

  /**
   * Query audit logs with filters
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    staffId?: string;
    action?: AuditAction;
    entity?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const { page = 1, limit = 50, staffId, action, entity, fromDate, toDate } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (staffId) where.staffId = staffId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          staff: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single audit log entry
   */
  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        staff: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  /**
   * Get summary stats for dashboard
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCount, totalCount, recentActions] = await Promise.all([
      this.prisma.auditLog.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.auditLog.count(),
      this.prisma.auditLog.groupBy({
        by: ["action"],
        _count: { action: true },
        orderBy: { _count: { action: "desc" } },
        take: 5,
      }),
    ]);

    return {
      todayCount,
      totalCount,
      topActions: recentActions.map((r) => ({
        action: r.action,
        count: r._count.action,
      })),
    };
  }
}
