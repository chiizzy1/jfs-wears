import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ShippingService } from "./shipping.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";

@Controller("shipping")
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  @Get("zones")
  async findAll() {
    return this.shippingService.findAll();
  }

  @Get("calculate")
  async calculate(@Query("state") state: string) {
    return this.shippingService.calculateShipping(state);
  }

  @Post("zones")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async create(@Body() data: { name: string; states: string[]; fee: number }) {
    return this.shippingService.create(data);
  }

  @Put("zones/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async update(@Param("id") id: string, @Body() data: any) {
    return this.shippingService.update(id, data);
  }
}
