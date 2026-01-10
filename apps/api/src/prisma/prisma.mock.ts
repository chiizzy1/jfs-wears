/**
 * Mock PrismaService for unit testing
 * Provides mock implementations of Prisma client methods
 */
import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const createMockPrismaService = (): MockPrismaClient => {
  return mockDeep<PrismaClient>();
};

/**
 * Simple mock factory without jest-mock-extended dependency
 * Use this if jest-mock-extended is not installed
 */
export const createSimpleMockPrismaService = () => {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    staff: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) =>
      callback({
        productVariant: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        order: {
          create: jest.fn(),
        },
      })
    ),
  };
};
