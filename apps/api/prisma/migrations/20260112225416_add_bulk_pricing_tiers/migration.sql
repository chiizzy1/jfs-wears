-- AlterTable
ALTER TABLE "products" ADD COLUMN     "bulkEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "bulk_pricing_tiers" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bulk_pricing_tiers_productId_idx" ON "bulk_pricing_tiers"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "bulk_pricing_tiers_productId_minQuantity_key" ON "bulk_pricing_tiers"("productId", "minQuantity");

-- AddForeignKey
ALTER TABLE "bulk_pricing_tiers" ADD CONSTRAINT "bulk_pricing_tiers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
