import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';
import { emitRfqUpdate } from '../realtime/socket.js';
import { getRankings, getRankingsFromBids } from './rankingService.js';
import { AuctionEngine } from './AuctionEngine.js';

const TRIGGER_TYPES = ['ANY_BID', 'ANY_RANK_CHANGE', 'L1_CHANGE'];

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseDate(value, label) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw httpError(400, `${label} must be a valid date`);
  return date;
}

function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw httpError(400, `${label} must be a positive whole number`);
  return number;
}

function nonNegativeNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw httpError(400, `${label} must be a valid non-negative number`);
  return number;
}

async function refreshStatus(rfq, client = prisma) {
  const status = AuctionEngine.getStatus(rfq);
  if (status !== rfq.status) {
    return client.rFQ.update({ where: { id: rfq.id }, data: { status } });
  }
  return { ...rfq, status };
}

export async function createRfq(input, buyerId) {
  const bidStartTime = parseDate(input.bidStartTime, 'Bid Start Time');
  const bidCloseTime = parseDate(input.bidCloseTime, 'Bid Close Time');
  const forcedCloseTime = parseDate(input.forcedCloseTime, 'Forced Close Time');
  const pickupServiceDate = parseDate(input.pickupServiceDate, 'Pickup / Service Date');
  const triggerWindowMinutes = positiveInteger(input.triggerWindowMinutes, 'Trigger Window Minutes');
  const extensionMinutes = positiveInteger(input.extensionMinutes, 'Extension Minutes');
  const triggerType = input.triggerType;
  const referenceId = input.referenceId?.trim();

  if (!referenceId) throw httpError(400, 'RFQ reference ID is required');
  if (!input.name?.trim()) throw httpError(400, 'RFQ name is required');
  if (!TRIGGER_TYPES.includes(triggerType)) throw httpError(400, 'Invalid trigger type');
  if (bidStartTime >= bidCloseTime) throw httpError(400, 'Bid Start Time must be before Bid Close Time');
  if (forcedCloseTime <= bidCloseTime) throw httpError(400, 'Forced Close Time must be greater than Bid Close Time');

  const rfq = await prisma.$transaction(async (tx) => {
    const rfq = await tx.rFQ.create({
      data: {
        referenceId,
        name: input.name.trim(),
        buyerId,
        bidStartTime,
        bidCloseTime,
        forcedCloseTime,
        pickupServiceDate,
        triggerWindowMinutes,
        extensionMinutes,
        triggerType,
        status: AuctionEngine.getStatus({ bidStartTime, bidCloseTime, forcedCloseTime })
      }
    });

    await tx.auctionLog.create({
      data: {
        rfqId: rfq.id,
        eventType: 'RFQ_CREATED',
        message: `RFQ "${rfq.name}" created with ${triggerType} trigger`
      }
    });

    return rfq;
  });

  emitRfqUpdate(rfq.id, 'rfq_created');
  return rfq;
}

export async function listRfqs() {
  const rfqs = await prisma.rFQ.findMany({
    include: {
      bids: { orderBy: [{ price: 'asc' }, { createdAt: 'asc' }], take: 1, select: { price: true } },
      _count: { select: { bids: true } },
      logs: { where: { eventType: 'AUCTION_EXTENDED' }, select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const rows = [];
  for (const rfq of rfqs) {
    const updated = await refreshStatus(rfq);
    rows.push({
      ...rfq,
      status: updated.status,
      lowestBid: rfq.bids[0]?.price ?? null,
      bidCount: rfq._count.bids,
      extensionCount: rfq.logs.length
    });
  }
  return rows;
}

export async function getRfqDetails(id) {
  const rfq = await prisma.rFQ.findUnique({ where: { id } });
  if (!rfq) throw httpError(404, 'RFQ not found');
  const updated = await refreshStatus(rfq);
  const rankings = await getRankings(prisma, id);
  const logs = await getLogs(id);
  const summary = buildAuctionSummary(rankings, logs);
  return { rfq: updated, bids: rankings, rankings, logs, summary };
}

export async function placeBid(rfqId, input, options = {}) {
  const freightCharges = nonNegativeNumber(input.freightCharges, 'Freight charges');
  const originCharges = nonNegativeNumber(input.originCharges, 'Origin charges');
  const destinationCharges = nonNegativeNumber(input.destinationCharges, 'Destination charges');
  const price = freightCharges + originCharges + destinationCharges;
  const supplierName = options.supplierName || input.supplierName;
  const quoteValidity = input.quoteValidity?.trim();

  if (!supplierName?.trim()) throw httpError(400, 'Supplier name is required');
  if (!input.transitTime?.trim()) throw httpError(400, 'Transit time is required');
  if (!quoteValidity) throw httpError(400, 'Quote validity is required');

  const result = await prisma.$transaction(async (tx) => {
    // PESSIMISTIC LOCK: Lock the RFQ row to prevent concurrent bid race conditions.
    const rawRfq = await tx.$queryRaw`SELECT * FROM "RFQ" WHERE id = ${rfqId} FOR UPDATE`;
    
    if (!rawRfq || rawRfq.length === 0) throw httpError(404, 'RFQ not found');

    const rfq = await tx.rFQ.findUnique({
      where: { id: rfqId },
      include: { bids: { include: { supplier: true }, orderBy: [{ price: 'asc' }, { createdAt: 'asc' }] } }
    });

    const now = new Date();
    const currentStatus = AuctionEngine.getStatus(rfq, now);
    if (currentStatus !== 'ACTIVE') throw httpError(400, `Auction is ${currentStatus}; bids are not allowed`);

    const currentLowest = rfq.bids[0];
    if (currentLowest && price >= Number(currentLowest.price)) {
      throw httpError(400, `New bid must be lower than current lowest bid ${Number(currentLowest.price).toFixed(2)}`);
    }

    const beforeRankings = getRankingsFromBids(rfq.bids);
    const supplier = await tx.supplier.upsert({
      where: { name: supplierName.trim() },
      update: {},
      create: { name: supplierName.trim() }
    });

    const bid = await tx.bid.create({
      data: {
        rfqId,
        supplierId: supplier.id,
        price: new Prisma.Decimal(price),
        freightCharges: new Prisma.Decimal(freightCharges),
        originCharges: new Prisma.Decimal(originCharges),
        destinationCharges: new Prisma.Decimal(destinationCharges),
        transitTime: input.transitTime.trim(),
        quoteValidity
      },
      include: { supplier: true }
    });

    await tx.auctionLog.create({
      data: {
        rfqId,
        eventType: 'BID_PLACED',
        message: `Bid placed by supplier ${supplier.name} for ${price.toFixed(2)}`
      }
    });

    const afterBids = await tx.bid.findMany({
      where: { rfqId },
      include: { supplier: true },
      orderBy: [{ price: 'asc' }, { createdAt: 'asc' }]
    });
    const afterRankings = getRankingsFromBids(afterBids);
    
    const engine = new AuctionEngine(rfq);
    const extension = engine.processBidExtension(beforeRankings, afterRankings, now);

    let updatedRfq = rfq;
    if (extension.shouldExtend) {
      updatedRfq = await tx.rFQ.update({
        where: { id: rfqId },
        data: { bidCloseTime: extension.newCloseTime }
      });
      const extensionByMinutes = Math.round((extension.newCloseTime.getTime() - extension.previousCloseTime.getTime()) / 60000);
      await tx.auctionLog.create({
        data: {
          rfqId,
          eventType: 'AUCTION_EXTENDED',
          message: `Auction extended by ${extensionByMinutes} min due to ${extension.reason}. Close time moved from ${extension.previousCloseTime.toISOString()} to ${extension.newCloseTime.toISOString()}`
        }
      });
    }

    return {
      bid,
      rfq: updatedRfq,
      rankings: afterRankings,
      updatedBidCloseTime: updatedRfq.bidCloseTime,
      extension
    };
  });

  emitRfqUpdate(rfqId, 'bid_placed');
  return result;
}

export async function getLogs(rfqId) {
  return prisma.auctionLog.findMany({
    where: { rfqId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function closeCheck(rfqId) {
  const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId } });
  if (!rfq) throw httpError(404, 'RFQ not found');
  const before = rfq.status;
  const updated = await refreshStatus(rfq);
  if (before !== updated.status) {
    await prisma.auctionLog.create({
      data: {
        rfqId,
        eventType: 'STATUS_UPDATED',
        message: `Auction status changed from ${before} to ${updated.status}`
      }
    });
  }
  emitRfqUpdate(rfqId, 'close_check');
  return updated;
}

export function buildAuctionSummary(rankings, logs) {
  const firstBid = [...rankings].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
  const l1Bid = rankings[0];
  const firstBidPrice = firstBid ? Number(firstBid.price) : 0;
  const finalPrice = l1Bid ? Number(l1Bid.price) : 0;
  const savings = firstBid && l1Bid ? Math.max(firstBidPrice - finalPrice, 0) : 0;
  const savingsPercent = firstBidPrice > 0 ? (savings / firstBidPrice) * 100 : 0;
  const extensionCount = logs.filter((log) => log.eventType === 'AUCTION_EXTENDED').length;

  return {
    l1Supplier: l1Bid?.supplier?.name || 'No bids yet',
    finalPrice,
    firstBidPrice,
    totalBids: rankings.length,
    extensionCount,
    savings,
    savingsPercent
  };
}

export const rfqHelpers = {
  statusFor: AuctionEngine.getStatus
};
