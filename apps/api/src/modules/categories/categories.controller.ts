import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";

@Controller("categories")
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

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
  async create(@Body() data: { name: string; slug: string; description?: string; parentId?: string }) {
    return this.categoriesService.create(data);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async update(@Param("id") id: string, @Body() data: any) {
    return this.categoriesService.update(id, data);
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
  async delete(@Param("id") id: string) {
    return this.categoriesService.delete(id);
  }
}
