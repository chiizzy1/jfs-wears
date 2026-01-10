import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return { users, total };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { addresses: true },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  // Update user profile
  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profileImage: true,
      },
    });
  }

  // Update profile image
  async updateProfileImage(userId: string, imageUrl: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
      },
    });
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new NotFoundException("User not found");
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: "Password changed successfully" };
  }

  // Admin soft delete
  async softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Admin restore
  async restore(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  // ============================================
  // ADDRESS MANAGEMENT
  // ============================================

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async createAddress(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      landmark?: string;
      isDefault?: boolean;
    }
  ) {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: { userId, ...data },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      landmark?: string;
      isDefault?: boolean;
    }
  ) {
    const addr = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!addr) throw new NotFoundException("Address not found");

    // If setting as default, unset others
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const addr = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!addr) throw new NotFoundException("Address not found");

    await this.prisma.address.delete({ where: { id: addressId } });
    return { message: "Address deleted" };
  }

  async getDefaultAddress(userId: string) {
    return this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  }
}
