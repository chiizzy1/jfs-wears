import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateStaffDto, UpdateStaffDto } from "./dto/staff.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.staff.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!staff) {
      throw new NotFoundException("Staff member not found");
    }

    return staff;
  }

  async create(dto: CreateStaffDto) {
    const existingStaff = await this.prisma.staff.findUnique({
      where: { email: dto.email },
    });

    if (existingStaff) {
      throw new ConflictException("Email already in use");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.staff.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role || "STAFF",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateStaffDto) {
    await this.findOne(id); // Throws if not found

    return this.prisma.staff.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async softDelete(id: string) {
    await this.findOne(id); // Throws if not found

    return this.prisma.staff.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async restore(id: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, deletedAt: { not: null } },
    });

    if (!staff) {
      throw new NotFoundException("Deleted staff member not found");
    }

    return this.prisma.staff.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
      },
    });
  }
}
