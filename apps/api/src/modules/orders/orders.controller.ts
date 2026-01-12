import { Controller, Get, Put, Post, Param, Query, Body, UseGuards, Request } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { OrderQueryDto, UpdateOrderStatusDto, CreateOrderDto, UpdateTrackingDto } from "./dto/orders.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Orders")
@Controller("orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

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
  async updateStatus(@Param("id") id: string, @Body() updateDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateDto.status);
  }

  @Put(":id/tracking")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async updateTracking(@Param("id") id: string, @Body() updateDto: UpdateTrackingDto) {
    return this.ordersService.updateTracking(id, updateDto);
  }
}
