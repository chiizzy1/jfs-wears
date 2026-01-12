import { Controller, Get, Put, Post, Param, Query, Body, UseGuards, Request } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { OrderQueryDto, UpdateOrderStatusDto, CreateOrderDto, UpdateTrackingDto } from "./dto/orders.dto";
import { ApiTags } from "@nestjs/swagger";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AuditAction } from "@prisma/client";

@ApiTags("Orders")
@Controller("orders")
export class OrdersController {
  constructor(private ordersService: OrdersService, private auditLogService: AuditLogService) {}

  // Guest checkout - no auth required
  @Post()
  async create(@Body() createDto: CreateOrderDto) {
    return this.ordersService.create(null, createDto);
  }

  // Customer's own orders (authenticated)
  @Get("my")
  @UseGuards(JwtAuthGuard)
  async findMyOrders(@Request() req: any) {
    return this.ordersService.findByUserId(req.user.sub);
  }

  // Admin - list all orders
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  // Public order tracking
  @Get("track/:orderNumber")
  async track(@Param("orderNumber") orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async findById(@Param("id") id: string) {
    return this.ordersService.findById(id);
  }

  @Put(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async updateStatus(@Request() req: any, @Param("id") id: string, @Body() updateDto: UpdateOrderStatusDto) {
    const order = await this.ordersService.findById(id);
    const oldStatus = order?.status;
    const result = await this.ordersService.updateStatus(id, updateDto.status);

    // Log the action
    await this.auditLogService.logFromRequest(
      req,
      AuditAction.ORDER_STATUS_UPDATE,
      "Order",
      id,
      `Updated order ${order?.orderNumber} status from ${oldStatus} to ${updateDto.status}`,
      { orderNumber: order?.orderNumber, oldStatus, newStatus: updateDto.status }
    );

    return result;
  }

  @Put(":id/tracking")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async updateTracking(@Request() req: any, @Param("id") id: string, @Body() updateDto: UpdateTrackingDto) {
    const order = await this.ordersService.findById(id);
    const result = await this.ordersService.updateTracking(id, updateDto);

    // Log the action
    await this.auditLogService.logFromRequest(
      req,
      AuditAction.UPDATE,
      "Order",
      id,
      `Updated tracking for order ${order?.orderNumber}`,
      { orderNumber: order?.orderNumber, tracking: updateDto }
    );

    return result;
  }
}
