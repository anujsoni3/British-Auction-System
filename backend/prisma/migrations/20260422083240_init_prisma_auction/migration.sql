-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('ANY_BID', 'ANY_RANK_CHANGE', 'L1_CHANGE');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'CLOSED', 'FORCE_CLOSED');

-- CreateEnum
CREATE TYPE "LogEventType" AS ENUM ('RFQ_CREATED', 'BID_PLACED', 'AUCTION_EXTENDED', 'STATUS_UPDATED');

-- CreateTable
CREATE TABLE "RFQ" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bidStartTime" TIMESTAMP(3) NOT NULL,
    "bidCloseTime" TIMESTAMP(3) NOT NULL,
    "forcedCloseTime" TIMESTAMP(3) NOT NULL,
    "triggerWindowMinutes" INTEGER NOT NULL,
    "extensionMinutes" INTEGER NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RFQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "freightCharges" DECIMAL(12,2) NOT NULL,
    "originCharges" DECIMAL(12,2) NOT NULL,
    "destinationCharges" DECIMAL(12,2) NOT NULL,
    "transitTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionLog" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "eventType" "LogEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RFQ_status_idx" ON "RFQ"("status");

-- CreateIndex
CREATE INDEX "RFQ_bidCloseTime_idx" ON "RFQ"("bidCloseTime");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");

-- CreateIndex
CREATE INDEX "Bid_rfqId_price_createdAt_idx" ON "Bid"("rfqId", "price", "createdAt");

-- CreateIndex
CREATE INDEX "AuctionLog_rfqId_createdAt_idx" ON "AuctionLog"("rfqId", "createdAt");

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "RFQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionLog" ADD CONSTRAINT "AuctionLog_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "RFQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;
