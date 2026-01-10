import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService, private configService: ConfigService) {}

  // ============================================
  // CUSTOMER AUTH
  // ============================================

  async registerCustomer(email: string, password: string, name?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, "customer");

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tokens,
    };
  }

  async loginCustomer(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.generateTokens(user.id, user.email, "customer");

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
      tokens,
    };
  }

  // ============================================
  // STAFF AUTH
  // ============================================

  async loginStaff(email: string, password: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { email },
    });

    if (!staff || !staff.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, staff.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.generateTokens(staff.id, staff.email, "staff", staff.role);

    return {
      user: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
      },
      tokens,
    };
  }

  async createStaff(email: string, password: string, name: string, role: "ADMIN" | "MANAGER" | "STAFF" = "STAFF") {
    const existingStaff = await this.prisma.staff.findUnique({
      where: { email },
    });

    if (existingStaff) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const staff = await this.prisma.staff.create({
      data: {
        email,
        passwordHash,
        name,
        role,
      },
    });

    return {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
    };
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  async generateTokens(userId: string, email: string, type: "customer" | "staff", role?: string) {
    const payload = { sub: userId, email, type, role };
    const secret = this.configService.get<string>("JWT_SECRET");
    const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET");

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: "15m",
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: "7d",
      }),
    ]);

    // Store refresh token hash
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: type === "customer" ? userId : null,
        staffId: type === "staff" ? userId : null,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      // Find token in DB (we can't find by hash directly, so we find by user and verify)
      // Actually, since we don't send the ID, we need to find all active tokens for user and match
      // Efficient way: Token ID in payload? But standard payload doesn't have it.
      // Better: User must send UserID? No, Payload has it.

      const userTokens = await this.prisma.refreshToken.findMany({
        where: {
          OR: [{ userId: payload.sub }, { staffId: payload.sub }],
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      let validToken = null;
      for (const token of userTokens) {
        const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
        if (isMatch) {
          validToken = token;
          break;
        }
      }

      if (!validToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Rotate tokens (revoke old, issue new)
      await this.prisma.refreshToken.update({
        where: { id: validToken.id },
        data: { isRevoked: true },
      });

      const tokens = await this.generateTokens(payload.sub, payload.email, payload.type, payload.role);
      return tokens;
    } catch (e) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: string) {
    // Revoke all tokens for user (or specific one if passed)
    // For safety, revoking all active tokens is a good simple logout
    await this.prisma.refreshToken.updateMany({
      where: {
        OR: [{ userId }, { staffId: userId }],
        isRevoked: false,
      },
      data: { isRevoked: true },
    });
  }

  async validateUser(userId: string, type: "customer" | "staff") {
    if (type === "customer") {
      return this.prisma.user.findUnique({ where: { id: userId } });
    } else {
      return this.prisma.staff.findUnique({ where: { id: userId } });
    }
  }

  // ============================================
  // PASSWORD RESET
  // ============================================

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: "If an account exists, a reset email has been sent" };
    }

    // Generate secure random token
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store token (invalidate any existing tokens for this user)
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // In production, send email here with the reset link
    // For now, log the token (remove in production!)
    const resetLink = `${this.configService.get("FRONTEND_URL") || "http://localhost:3000"}/reset-password?token=${token}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);

    // TODO: Send email using EmailService
    // await this.emailService.sendPasswordReset(email, resetLink);

    return { message: "If an account exists, a reset email has been sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new UnauthorizedException("Invalid or expired reset token");
    }

    if (resetToken.usedAt) {
      throw new UnauthorizedException("This reset link has already been used");
    }

    if (new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException("Reset link has expired");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens for security
      this.prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId },
        data: { isRevoked: true },
      }),
    ]);

    return { message: "Password reset successfully" };
  }
}
