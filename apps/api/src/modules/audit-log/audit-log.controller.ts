import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { AuditLogService } from "./audit-log.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { AuditAction } from "@prisma/client";

@ApiTags("Audit Logs")
@ApiBearerAuth()
@Controller("audit-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN") // Only admins can view audit logs
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: "Get all audit logs with filters" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "staffId", required: false, type: String })
  @ApiQuery({ name: "action", required: false, enum: AuditAction })
  @ApiQuery({ name: "entity", required: false, type: String })
  @ApiQuery({ name: "fromDate", required: false, type: String })
  @ApiQuery({ name: "toDate", required: false, type: String })
  findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("staffId") staffId?: string,
    @Query("action") action?: AuditAction,
    @Query("entity") entity?: string,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string
  ) {
    return this.auditLogService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
      staffId,
      action,
      entity,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get("stats")
  @ApiOperation({ summary: "Get audit log statistics" })
  getStats() {
    return this.auditLogService.getStats();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single audit log entry" })
  findOne(@Param("id") id: string) {
    return this.auditLogService.findOne(id);
  }
}
