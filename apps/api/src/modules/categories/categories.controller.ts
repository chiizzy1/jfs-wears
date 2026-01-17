import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AuditAction } from "@prisma/client";

@Controller("categories")
export class CategoriesController {
  constructor(
    private categoriesService: CategoriesService,
    private auditLogService: AuditLogService,
  ) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(":slug")
  async findBySlug(@Param("slug") slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async create(@Request() req: any, @Body() data: { name: string; slug: string; description?: string; parentId?: string }) {
    const result = await this.categoriesService.create(data);
    await this.auditLogService.logFromRequest(
      req,
      AuditAction.CREATE,
      "Category",
      result.id,
      `Created category "${result.name}"`,
      { categoryName: result.name, slug: result.slug },
    );
    return result;
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async update(@Request() req: any, @Param("id") id: string, @Body() data: any) {
    const result = await this.categoriesService.update(id, data);
    await this.auditLogService.logFromRequest(req, AuditAction.UPDATE, "Category", id, `Updated category "${result.name}"`, {
      categoryName: result.name,
      changes: Object.keys(data),
    });
    return result;
  }

  @Put(":id/featured")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async toggleFeatured(@Param("id") id: string, @Body() data: { featured: boolean; position?: number }) {
    return this.categoriesService.toggleFeatured(id, data.featured, data.position);
  }

  @Put(":id/featured-position")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async updateFeaturedPosition(@Param("id") id: string, @Body() data: { position: number }) {
    return this.categoriesService.updateFeaturedPosition(id, data.position);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async delete(@Request() req: any, @Param("id") id: string) {
    const result = await this.categoriesService.delete(id);
    await this.auditLogService.logFromRequest(req, AuditAction.DELETE, "Category", id, `Deleted category "${result?.name}"`, {
      categoryName: result?.name,
    });
    return result;
  }
}
