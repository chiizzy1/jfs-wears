import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: { children: true },
    });
  }

  async create(data: { name: string; slug: string; description?: string; parentId?: string }) {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; slug: string; description: string; isActive: boolean }>) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
