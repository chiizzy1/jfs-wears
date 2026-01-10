import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { PromotionsService } from "./promotions.service";
import { CreatePromotionDto, UpdatePromotionDto, ValidatePromotionDto } from "./dto/promotions.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";

@ApiTags("Promotions")
@Controller("promotions")
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all promotions" })
  @ApiQuery({ name: "includeInactive", required: false, type: Boolean })
  findAll(@Query("includeInactive") includeInactive?: boolean) {
    return this.promotionsService.findAll(includeInactive === true);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a promotion by ID" })
  findOne(@Param("id") id: string) {
    return this.promotionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new promotion" })
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a promotion" })
  update(@Param("id") id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionsService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a promotion" })
  remove(@Param("id") id: string) {
    return this.promotionsService.delete(id);
  }

  // Public endpoint for validating promo codes
  @Post("validate")
  @ApiOperation({ summary: "Validate a promotion code" })
  validate(@Body() dto: ValidatePromotionDto) {
    return this.promotionsService.validate(dto);
  }
}
