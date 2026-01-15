import { Injectable, NotFoundException, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateBlogPostDto, UpdateBlogPostDto } from "./blog.dto";

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // PUBLIC
  // ============================================

  async findAllPublished() {
    return this.prisma.blogPost.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async findPublishedBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
      },
    });

    if (!post || !post.isPublished || post.deletedAt) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }

    return post;
  }

  // ============================================
  // ADMIN
  // ============================================

  async findAllAdmin() {
    return this.prisma.blogPost.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async findById(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async create(dto: CreateBlogPostDto, authorId: string) {
    // Check if slug exists
    const existing = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new BadRequestException("Slug already exists");
    }

    // Get author name snapshot
    const staff = await this.prisma.staff.findUnique({ where: { id: authorId } });

    const post = await this.prisma.blogPost.create({
      data: {
        ...dto,
        authorId,
        authorName: staff?.name,
        publishedAt: dto.isPublished ? new Date() : null,
      },
    });

    this.logger.log(`Created blog post: ${post.id} (${post.title})`);
    return post;
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.findById(id);

    // Check slug uniqueness if changing
    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
      if (slugExists) throw new BadRequestException("Slug already exists");
    }

    // Handle publishing logic
    let publishedAt = existing.publishedAt;
    if (dto.isPublished === true && !existing.isPublished) {
      publishedAt = new Date();
    } else if (dto.isPublished === false) {
      publishedAt = null;
    }

    const updated = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...dto,
        publishedAt,
      },
    });

    this.logger.log(`Updated blog post: ${id}`);
    return updated;
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });
    this.logger.log(`Deleted blog post: ${id}`);
    return { message: "Post deleted successfully" };
  }
}
