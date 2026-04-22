import test from 'node:test';
import assert from 'node:assert/strict';
import { getRankingsFromBids } from '../src/services/rankingService.js';
import { buildAuctionSummary, rfqHelpers } from '../src/services/rfqService.js';

const baseRfq = {
  id: 'rfq-1',
  bidStartTime: new Date('2026-04-22T10:00:00.000Z'),
  bidCloseTime: new Date('2026-04-22T11:00:00.000Z'),
  forcedCloseTime: new Date('2026-04-22T11:30:00.000Z'),
  triggerWindowMinutes: 10,
  extensionMinutes: 5,
  triggerType: 'ANY_BID',
  status: 'ACTIVE'
};

function bid(id, supplierId, price, createdAt = '2026-04-22T10:30:00.000Z') {
  return { id, supplierId, price, createdAt: new Date(createdAt) };
}

test('status uses backend time and returns ACTIVE inside bidding window', () => {
  assert.equal(rfqHelpers.statusFor(baseRfq, new Date('2026-04-22T10:30:00.000Z')), 'ACTIVE');
});

test('status returns CLOSED after bid close before forced close', () => {
  assert.equal(rfqHelpers.statusFor(baseRfq, new Date('2026-04-22T11:05:00.000Z')), 'CLOSED');
});

test('status returns FORCE_CLOSED at forced close', () => {
  assert.equal(rfqHelpers.statusFor(baseRfq, new Date('2026-04-22T11:30:00.000Z')), 'FORCE_CLOSED');
});

test('getRankingsFromBids sorts ascending and assigns L ranks', () => {
  const rankings = getRankingsFromBids([bid('b1', 's1', 500), bid('b2', 's2', 400), bid('b3', 's3', 450)]);
  assert.deepEqual(rankings.map((item) => item.rank), ['L1', 'L2', 'L3']);
  assert.deepEqual(rankings.map((item) => item.supplierId), ['s2', 's3', 's1']);
});

test('ANY_BID inside trigger window extends auction', () => {
  const decision = rfqHelpers.extensionDecision(baseRfq, [], [bid('b1', 's1', 500)], new Date('2026-04-22T10:55:00.000Z'));
  assert.equal(decision.shouldExtend, true);
  assert.equal(decision.newCloseTime.toISOString(), '2026-04-22T11:05:00.000Z');
});

test('bid outside trigger window does not extend auction', () => {
  const decision = rfqHelpers.extensionDecision(baseRfq, [], [bid('b1', 's1', 500)], new Date('2026-04-22T10:40:00.000Z'));
  assert.equal(decision.shouldExtend, false);
});

test('extension never exceeds forced close time', () => {
  const rfq = {
    ...baseRfq,
    bidCloseTime: new Date('2026-04-22T11:28:00.000Z'),
    forcedCloseTime: new Date('2026-04-22T11:30:00.000Z')
  };
  const decision = rfqHelpers.extensionDecision(rfq, [], [bid('b1', 's1', 500)], new Date('2026-04-22T11:25:00.000Z'));
  assert.equal(decision.shouldExtend, true);
  assert.equal(decision.newCloseTime.toISOString(), '2026-04-22T11:30:00.000Z');
});

test('ANY_RANK_CHANGE extends when supplier ranking changes', () => {
  const rfq = { ...baseRfq, triggerType: 'ANY_RANK_CHANGE' };
  const before = getRankingsFromBids([bid('b1', 's1', 500), bid('b2', 's2', 600)]);
  const after = getRankingsFromBids([...before, bid('b3', 's2', 450, '2026-04-22T10:55:00.000Z')]);
  const decision = rfqHelpers.extensionDecision(rfq, before, after, new Date('2026-04-22T10:55:00.000Z'));
  assert.equal(decision.shouldExtend, true);
});

test('L1_CHANGE extends only when existing L1 changes', () => {
  const rfq = { ...baseRfq, triggerType: 'L1_CHANGE' };
  const before = getRankingsFromBids([bid('b1', 's1', 500), bid('b2', 's2', 600)]);
  const after = getRankingsFromBids([...before, bid('b3', 's2', 450, '2026-04-22T10:55:00.000Z')]);
  const decision = rfqHelpers.extensionDecision(rfq, before, after, new Date('2026-04-22T10:55:00.000Z'));
  assert.equal(decision.shouldExtend, true);
});

test('L1_CHANGE does not extend for first bid', () => {
  const rfq = { ...baseRfq, triggerType: 'L1_CHANGE' };
  const decision = rfqHelpers.extensionDecision(rfq, [], getRankingsFromBids([bid('b1', 's1', 500)]), new Date('2026-04-22T10:55:00.000Z'));
  assert.equal(decision.shouldExtend, false);
});

test('auction summary shows buyer savings, total bids, and extension count', () => {
  const rankings = getRankingsFromBids([
    { ...bid('b1', 's1', 1000, '2026-04-22T10:01:00.000Z'), supplier: { name: 'First Carrier' } },
    { ...bid('b2', 's2', 800, '2026-04-22T10:05:00.000Z'), supplier: { name: 'Best Carrier' } }
  ]);
  const logs = [{ eventType: 'AUCTION_EXTENDED' }, { eventType: 'BID_PLACED' }, { eventType: 'AUCTION_EXTENDED' }];
  const summary = buildAuctionSummary(rankings, logs);

  assert.equal(summary.l1Supplier, 'Best Carrier');
  assert.equal(summary.finalPrice, 800);
  assert.equal(summary.firstBidPrice, 1000);
  assert.equal(summary.totalBids, 2);
  assert.equal(summary.extensionCount, 2);
  assert.equal(summary.savings, 200);
  assert.equal(summary.savingsPercent, 20);
});
