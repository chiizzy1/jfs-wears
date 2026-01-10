import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";

@ApiTags("Analytics")
@ApiBearerAuth()
@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("dashboard")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Get dashboard summary metrics" })
  getDashboard() {
    return this.analyticsService.getDashboardSummary();
  }

  @Get("revenue")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Get revenue breakdown by period" })
  @ApiQuery({ name: "period", enum: ["day", "week", "month"], required: false })
  getRevenue(@Query("period") period: "day" | "week" | "month" = "month") {
    return this.analyticsService.getRevenueByPeriod(period);
  }

  @Get("low-stock")
  @Roles("ADMIN", "MANAGER", "STAFF")
  @ApiOperation({ summary: "Get products with low stock" })
  @ApiQuery({ name: "threshold", type: Number, required: false })
  getLowStock(@Query("threshold") threshold?: number) {
    return this.analyticsService.getLowStockProducts(threshold || 10);
  }
}
