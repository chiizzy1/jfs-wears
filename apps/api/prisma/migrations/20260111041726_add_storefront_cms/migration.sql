-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('FEATURED', 'CATEGORY', 'COLLECTION');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "storefront_heroes" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "subheadline" TEXT,
    "ctaText" TEXT DEFAULT 'Shop Now',
    "ctaLink" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "thumbnailUrl" TEXT,
    "productId" TEXT,
    "categoryId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storefront_heroes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storefront_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "type" "SectionType" NOT NULL DEFAULT 'FEATURED',
    "categoryId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxProducts" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storefront_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "storefront_heroes_order_idx" ON "storefront_heroes"("order");

-- CreateIndex
CREATE INDEX "storefront_heroes_isActive_idx" ON "storefront_heroes"("isActive");

-- CreateIndex
CREATE INDEX "storefront_sections_order_idx" ON "storefront_sections"("order");

-- CreateIndex
CREATE INDEX "storefront_sections_isActive_idx" ON "storefront_sections"("isActive");

-- AddForeignKey
ALTER TABLE "storefront_heroes" ADD CONSTRAINT "storefront_heroes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storefront_heroes" ADD CONSTRAINT "storefront_heroes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storefront_sections" ADD CONSTRAINT "storefront_sections_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
