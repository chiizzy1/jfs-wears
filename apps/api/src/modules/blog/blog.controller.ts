import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query, Req, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BlogService } from "./blog.service";
import { CreateBlogPostDto, UpdateBlogPostDto } from "./blog.dto";
import { CookieAuthGuard } from "../auth/guards/cookie-auth.guard";
import { Request } from "express";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AuditAction } from "@prisma/client";

@ApiTags("Blog")
@Controller()
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly auditLogService: AuditLogService,
  ) {}

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
    // JWT strategy returns 'sub' as the user ID, not 'id'
    const authorId = req.user?.sub || req.user?.id;
    const result = await this.blogService.create(dto, authorId);
    await this.auditLogService.logFromRequest(
      req,
      AuditAction.CREATE,
      "BlogPost",
      result.id,
      `Created blog post "${result.title}"`,
      { title: result.title, slug: result.slug },
    );
    return result;
  }

  @Patch("admin/blog/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update blog post" })
  async updatePost(@Param("id") id: string, @Body() dto: UpdateBlogPostDto, @Req() req: any) {
    const result = await this.blogService.update(id, dto);
    await this.auditLogService.logFromRequest(req, AuditAction.UPDATE, "BlogPost", id, `Updated blog post "${result.title}"`, {
      title: result.title,
      changes: Object.keys(dto),
    });
    return result;
  }

  @Delete("admin/blog/:id")
  @UseGuards(CookieAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete blog post" })
  async deletePost(@Param("id") id: string, @Req() req: any) {
    const post = await this.blogService.findById(id);
    const result = await this.blogService.delete(id);
    await this.auditLogService.logFromRequest(req, AuditAction.DELETE, "BlogPost", id, `Deleted blog post "${post?.title}"`, {
      title: post?.title,
    });
    return result;
  }
}
