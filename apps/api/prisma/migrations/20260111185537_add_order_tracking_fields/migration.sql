-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "carrierName" TEXT,
ADD COLUMN     "estimatedDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "statusHistory" JSONB,
ADD COLUMN     "trackingNumber" TEXT;
