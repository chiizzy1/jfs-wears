import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { StorefrontService } from "./storefront.service";
import { CreateHeroDto, UpdateHeroDto, CreateSectionDto, UpdateSectionDto, ReorderDto } from "./storefront.dto";
import { CookieAuthGuard } from "../auth/guards/cookie-auth.guard";

@ApiTags("Storefront")
@Controller()
export class StorefrontController {
  constructor(private readonly storefrontService: StorefrontService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get("storefront")
  @ApiOperation({ summary: "Get public storefront data (heroes + sections with products)" })
  async getPublicStorefront() {
    return this.storefrontService.getPublicStorefront();
  }

  // ============================================
  // ADMIN: HERO SLIDES
  // ============================================

  @Get("admin/storefront/heroes")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all hero slides (admin)" })
  @ApiQuery({ name: "activeOnly", required: false, type: Boolean })
  async getAllHeroes(@Query("activeOnly") activeOnly?: string) {
    return this.storefrontService.findAllHeroes(activeOnly === "true");
  }

  @Get("admin/storefront/heroes/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get hero slide by ID" })
  async getHeroById(@Param("id") id: string) {
    return this.storefrontService.findHeroById(id);
  }

  @Post("admin/storefront/heroes")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new hero slide" })
  async createHero(@Body() dto: CreateHeroDto) {
    return this.storefrontService.createHero(dto);
  }

  @Patch("admin/storefront/heroes/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update hero slide" })
  async updateHero(@Param("id") id: string, @Body() dto: UpdateHeroDto) {
    return this.storefrontService.updateHero(id, dto);
  }

  @Delete("admin/storefront/heroes/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete hero slide" })
  async deleteHero(@Param("id") id: string) {
    return this.storefrontService.deleteHero(id);
  }

  @Post("admin/storefront/heroes/reorder")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reorder hero slides" })
  async reorderHeroes(@Body() dto: ReorderDto) {
    return this.storefrontService.reorderHeroes(dto);
  }

  // ============================================
  // ADMIN: SECTIONS
  // ============================================

  @Get("admin/storefront/sections")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all sections (admin)" })
  @ApiQuery({ name: "activeOnly", required: false, type: Boolean })
  async getAllSections(@Query("activeOnly") activeOnly?: string) {
    return this.storefrontService.findAllSections(activeOnly === "true");
  }

  @Get("admin/storefront/sections/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get section by ID" })
  async getSectionById(@Param("id") id: string) {
    return this.storefrontService.findSectionById(id);
  }

  @Post("admin/storefront/sections")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new section" })
  async createSection(@Body() dto: CreateSectionDto) {
    return this.storefrontService.createSection(dto);
  }

  @Patch("admin/storefront/sections/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update section" })
  async updateSection(@Param("id") id: string, @Body() dto: UpdateSectionDto) {
    return this.storefrontService.updateSection(id, dto);
  }

  @Delete("admin/storefront/sections/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete section" })
  async deleteSection(@Param("id") id: string) {
    return this.storefrontService.deleteSection(id);
  }

  @Post("admin/storefront/sections/reorder")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reorder sections" })
  async reorderSections(@Body() dto: ReorderDto) {
    return this.storefrontService.reorderSections(dto);
  }
}
