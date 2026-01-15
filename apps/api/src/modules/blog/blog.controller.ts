import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query, Req, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BlogService } from "./blog.service";
import { CreateBlogPostDto, UpdateBlogPostDto } from "./blog.dto";
import { CookieAuthGuard } from "../auth/guards/cookie-auth.guard";
import { Request } from "express";

@ApiTags("Blog")
@Controller()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get("blog")
  @ApiOperation({ summary: "Get all published blog posts" })
  async getPublishedPosts() {
    return this.blogService.findAllPublished();
  }

  @Get("blog/:slug")
  @ApiOperation({ summary: "Get published post by slug" })
  async getPostBySlug(@Param("slug") slug: string) {
    return this.blogService.findPublishedBySlug(slug);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Get("admin/blog")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all blog posts (admin)" })
  async getAllAdminPosts() {
    return this.blogService.findAllAdmin();
  }

  @Get("admin/blog/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get post by ID (admin)" })
  async getAdminPostById(@Param("id") id: string) {
    return this.blogService.findById(id);
  }

  @Post("admin/blog")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new blog post" })
  async createPost(@Body() dto: CreateBlogPostDto, @Req() req: any) {
    // Determine author from request User or Staff
    // The CookieAuthGuard attaches 'user' (which is the Staff entity in admin context usually, or we check structure)
    // Actually, CookieAuthGuard for admin routes usually validates Staff.
    // Let's assume req.user.id is the staff ID for now.
    return this.blogService.create(dto, req.user?.id);
  }

  @Patch("admin/blog/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update blog post" })
  async updatePost(@Param("id") id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete("admin/blog/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete blog post" })
  async deletePost(@Param("id") id: string) {
    return this.blogService.delete(id);
  }
}
