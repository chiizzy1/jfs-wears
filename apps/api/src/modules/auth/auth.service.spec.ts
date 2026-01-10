import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../prisma/prisma.service";

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    staff: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    passwordResetToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    passwordHash: "hashed-password",
    phone: null,
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockTokens = {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      staff: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      passwordResetToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === "JWT_SECRET") return "test-jwt-secret";
        if (key === "JWT_REFRESH_SECRET") return "test-refresh-secret";
        if (key === "FRONTEND_URL") return "http://localhost:3000";
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerCustomer", () => {
    it("should successfully register a new customer", async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (jwtService.signAsync as jest.Mock).mockResolvedValueOnce("access-token").mockResolvedValueOnce("refresh-token");
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue({});

      // Act
      const result = await service.registerCustomer("test@example.com", "password123", "Test User");

      // Assert
      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("tokens");
      expect(result.user.email).toBe("test@example.com");
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          passwordHash: "hashed-password",
          name: "Test User",
        },
      });
    });

    it("should throw ConflictException if email already exists", async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.registerCustomer("test@example.com", "password123", "Test User")).rejects.toThrow(ConflictException);
    });
  });

  describe("loginCustomer", () => {
    it("should successfully login a customer with valid credentials", async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValueOnce("access-token").mockResolvedValueOnce("refresh-token");
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue({});

      // Act
      const result = await service.loginCustomer("test@example.com", "password123");

      // Assert
      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("tokens");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.loginCustomer("nonexistent@example.com", "password123")).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.loginCustomer("test@example.com", "wrong-password")).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("generateTokens", () => {
    it("should generate access and refresh tokens", async () => {
      // Arrange
      (jwtService.signAsync as jest.Mock).mockResolvedValueOnce("access-token").mockResolvedValueOnce("refresh-token");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-refresh-token");
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue({});

      // Act
      const result = await service.generateTokens("user-123", "test@example.com", "customer");

      // Assert
      expect(result).toHaveProperty("accessToken", "access-token");
      expect(result).toHaveProperty("refreshToken", "refresh-token");
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(prismaService.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe("refreshTokens", () => {
    it("should rotate tokens successfully", async () => {
      // Arrange
      const mockPayload = { sub: "user-123", email: "test@example.com", type: "customer" };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (prismaService.refreshToken.findMany as jest.Mock).mockResolvedValue([
        { id: "token-1", tokenHash: "hashed-token", isRevoked: false },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prismaService.refreshToken.update as jest.Mock).mockResolvedValue({});
      (jwtService.signAsync as jest.Mock).mockResolvedValueOnce("new-access-token").mockResolvedValueOnce("new-refresh-token");
      (bcrypt.hash as jest.Mock).mockResolvedValue("new-hashed-token");
      (prismaService.refreshToken.create as jest.Mock).mockResolvedValue({});

      // Act
      const result = await service.refreshTokens("valid-refresh-token");

      // Assert
      expect(result).toHaveProperty("accessToken", "new-access-token");
      expect(result).toHaveProperty("refreshToken", "new-refresh-token");
      expect(prismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "token-1" },
        data: { isRevoked: true },
      });
    });

    it("should throw UnauthorizedException for invalid refresh token", async () => {
      // Arrange
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error("Invalid token"));

      // Act & Assert
      await expect(service.refreshTokens("invalid-token")).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should revoke all tokens for user", async () => {
      // Arrange
      (prismaService.refreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      // Act
      await service.logout("user-123");

      // Assert
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          OR: [{ userId: "user-123" }, { staffId: "user-123" }],
          isRevoked: false,
        },
        data: { isRevoked: true },
      });
    });
  });

  describe("resetPassword", () => {
    it("should throw UnauthorizedException for invalid token", async () => {
      // Arrange
      (prismaService.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword("invalid-token", "new-password")).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for expired token", async () => {
      // Arrange
      const expiredToken = {
        id: "token-1",
        token: "expired-token",
        userId: "user-123",
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        usedAt: null,
      };
      (prismaService.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(expiredToken);

      // Act & Assert
      await expect(service.resetPassword("expired-token", "new-password")).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for already used token", async () => {
      // Arrange
      const usedToken = {
        id: "token-1",
        token: "used-token",
        userId: "user-123",
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        usedAt: new Date(), // Already used
      };
      (prismaService.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(usedToken);

      // Act & Assert
      await expect(service.resetPassword("used-token", "new-password")).rejects.toThrow(UnauthorizedException);
    });
  });
});
