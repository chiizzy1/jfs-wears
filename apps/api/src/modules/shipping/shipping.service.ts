import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { fee: "asc" },
    });
  }

  async findByState(state: string) {
    return this.prisma.shippingZone.findFirst({
      where: {
        isActive: true,
        states: { has: state },
      },
    });
  }

  async calculateShipping(state: string): Promise<{ zone: any; fee: number }> {
    const zone = await this.findByState(state);
    return { zone, fee: zone ? Number(zone.fee) : 0 };
  }

  async create(data: { name: string; states: string[]; fee: number }) {
    return this.prisma.shippingZone.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; states: string[]; fee: number; isActive: boolean }>) {
    return this.prisma.shippingZone.update({ where: { id }, data });
  }
}
