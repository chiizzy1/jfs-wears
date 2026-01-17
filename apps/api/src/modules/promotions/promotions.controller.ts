import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { PromotionsService } from "./promotions.service";
import { CreatePromotionDto, UpdatePromotionDto, ValidatePromotionDto } from "./dto/promotions.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AuditAction } from "@prisma/client";

@ApiTags("Promotions")
@Controller("promotions")
export class PromotionsController {
  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly auditLogService: AuditLogService,
  ) {}

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
  async create(@Request() req: any, @Body() dto: CreatePromotionDto) {
    const result = await this.promotionsService.create(dto);
    await this.auditLogService.logFromRequest(
      req,
      AuditAction.CREATE,
      "Promotion",
      result.id,
      `Created promotion "${result.code}"`,
      { code: result.code, type: result.type, value: result.value },
    );
    return result;
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a promotion" })
  async update(@Request() req: any, @Param("id") id: string, @Body() dto: UpdatePromotionDto) {
    const result = await this.promotionsService.update(id, dto);
    await this.auditLogService.logFromRequest(req, AuditAction.UPDATE, "Promotion", id, `Updated promotion "${result.code}"`, {
      code: result.code,
      changes: Object.keys(dto),
    });
    return result;
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a promotion" })
  async remove(@Request() req: any, @Param("id") id: string) {
    const promotion = await this.promotionsService.findOne(id);
    const result = await this.promotionsService.delete(id);
    await this.auditLogService.logFromRequest(
      req,
      AuditAction.DELETE,
      "Promotion",
      id,
      `Deleted promotion "${promotion?.code}"`,
      { code: promotion?.code },
    );
    return result;
  }

  // Public endpoint for validating promo codes
  @Post("validate")
  @ApiOperation({ summary: "Validate a promotion code" })
  validate(@Body() dto: ValidatePromotionDto) {
    return this.promotionsService.validate(dto);
  }
}
