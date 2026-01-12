import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from "@nestjs/common";
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

  // ============================================
  // SELF-SERVICE PROFILE MANAGEMENT
  // ============================================

  /**
   * Get current staff member's profile
   */
  async getMyProfile(staffId: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!staff) {
      throw new NotFoundException("Staff member not found");
    }

    return staff;
  }

  /**
   * Update current staff member's own profile (name only, email requires admin)
   */
  async updateMyProfile(staffId: string, data: { name?: string }) {
    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, deletedAt: null },
    });

    if (!staff) {
      throw new NotFoundException("Staff member not found");
    }

    return this.prisma.staff.update({
      where: { id: staffId },
      data: { name: data.name },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        role: true,
      },
    });
  }

  /**
   * Change current staff member's own password
   */
  async changeMyPassword(staffId: string, currentPassword: string, newPassword: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, deletedAt: null },
    });

    if (!staff) {
      throw new NotFoundException("Staff member not found");
    }

    const isValid = await bcrypt.compare(currentPassword, staff.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.staff.update({
      where: { id: staffId },
      data: { passwordHash: newHash },
    });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { staffId },
      data: { isRevoked: true },
    });

    return { message: "Password changed successfully" };
  }

  /**
   * Update current staff member's profile image
   */
  async updateMyProfileImage(staffId: string, imageUrl: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id: staffId, deletedAt: null },
    });

    if (!staff) {
      throw new NotFoundException("Staff member not found");
    }

    return this.prisma.staff.update({
      where: { id: staffId },
      data: { profileImage: imageUrl },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        role: true,
      },
    });
  }
}
