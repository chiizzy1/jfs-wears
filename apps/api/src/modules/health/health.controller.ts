import { PrismaService } from "@/prisma/prisma.service";
import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", database: "connected", timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: "error", database: "disconnected", timestamp: new Date().toISOString() };
    }
  }
}
