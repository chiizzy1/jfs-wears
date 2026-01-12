/*
  Warnings:

  - A unique constraint covering the columns `[productId,size,colorGroupId]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'ORDER_STATUS_UPDATE', 'ORDER_CANCEL', 'ORDER_REFUND', 'SETTINGS_UPDATE', 'EXPORT_DATA');

-- DropIndex
DROP INDEX "product_variants_productId_size_color_key";

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "colorGroupId" TEXT;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "profileImage" TEXT;

-- CreateTable
CREATE TABLE "color_groups" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "colorHex" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "color_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_images" (
    "id" TEXT NOT NULL,
    "colorGroupId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "variant_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size_presets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sizes" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "size_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "color_presets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hexCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "color_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "staffId" TEXT,
    "staffEmail" TEXT,
    "staffName" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "color_groups_productId_idx" ON "color_groups"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "color_groups_productId_colorName_key" ON "color_groups"("productId", "colorName");

-- CreateIndex
CREATE INDEX "variant_images_colorGroupId_idx" ON "variant_images"("colorGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "size_presets_name_key" ON "size_presets"("name");

-- CreateIndex
CREATE UNIQUE INDEX "color_presets_name_key" ON "color_presets"("name");

-- CreateIndex
CREATE INDEX "audit_logs_staffId_idx" ON "audit_logs"("staffId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "product_variants_colorGroupId_idx" ON "product_variants"("colorGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_productId_size_colorGroupId_key" ON "product_variants"("productId", "size", "colorGroupId");

-- AddForeignKey
ALTER TABLE "color_groups" ADD CONSTRAINT "color_groups_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_images" ADD CONSTRAINT "variant_images_colorGroupId_fkey" FOREIGN KEY ("colorGroupId") REFERENCES "color_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_colorGroupId_fkey" FOREIGN KEY ("colorGroupId") REFERENCES "color_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
