-- AlterTable
ALTER TABLE "RFQ"
ADD COLUMN "referenceId" TEXT,
ADD COLUMN "pickupServiceDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Bid"
ADD COLUMN "quoteValidity" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RFQ_referenceId_key" ON "RFQ"("referenceId");
