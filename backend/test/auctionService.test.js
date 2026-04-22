import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getExtensionDecision,
  rankBids,
  resolveStatus
} from '../src/services/auctionService.js';

const baseRfq = {
  bid_start_time: '2026-04-22T10:00:00.000Z',
  current_bid_close_time: '2026-04-22T11:00:00.000Z',
  forced_bid_close_time: '2026-04-22T11:30:00.000Z',
  trigger_window_minutes: 10,
  extension_duration_minutes: 5,
  extension_trigger_type: 'BID_RECEIVED'
};

function bid(id, supplierId, totalPrice, submittedAt = '2026-04-22T10:30:00.000Z') {
  return { id, supplier_id: supplierId, total_price: totalPrice, submitted_at: submittedAt };
}

test('resolveStatus returns Active inside bidding window', () => {
  assert.equal(resolveStatus(baseRfq, new Date('2026-04-22T10:30:00.000Z')), 'Active');
});

test('resolveStatus returns Closed after current close before forced close', () => {
  assert.equal(resolveStatus(baseRfq, new Date('2026-04-22T11:05:00.000Z')), 'Closed');
});

test('resolveStatus returns Force Closed at forced close', () => {
  assert.equal(resolveStatus(baseRfq, new Date('2026-04-22T11:30:00.000Z')), 'Force Closed');
});

test('rankBids sorts by total price ascending', () => {
  const ranked = rankBids([bid(1, 10, 500), bid(2, 11, 400), bid(3, 12, 450)]);
  assert.deepEqual(ranked.map((item) => item.rank), ['L1', 'L2', 'L3']);
  assert.deepEqual(ranked.map((item) => item.supplier_id), [11, 12, 10]);
});

test('bid received inside trigger window extends auction', () => {
  const decision = getExtensionDecision({
    rfq: baseRfq,
    submittedAt: '2026-04-22T10:55:00.000Z',
    beforeRanked: [],
    afterRanked: [bid(1, 10, 500)]
  });

  assert.equal(decision.shouldExtend, true);
  assert.equal(decision.newCloseTime, '2026-04-22T11:05:00.000Z');
});

test('bid outside trigger window does not extend auction', () => {
  const decision = getExtensionDecision({
    rfq: baseRfq,
    submittedAt: '2026-04-22T10:40:00.000Z',
    beforeRanked: [],
    afterRanked: [bid(1, 10, 500)]
  });

  assert.equal(decision.shouldExtend, false);
});

test('extension never exceeds forced close', () => {
  const rfq = {
    ...baseRfq,
    current_bid_close_time: '2026-04-22T11:28:00.000Z',
    forced_bid_close_time: '2026-04-22T11:30:00.000Z'
  };
  const decision = getExtensionDecision({
    rfq,
    submittedAt: '2026-04-22T11:25:00.000Z',
    beforeRanked: [],
    afterRanked: [bid(1, 10, 500)]
  });

  assert.equal(decision.shouldExtend, true);
  assert.equal(decision.newCloseTime, '2026-04-22T11:30:00.000Z');
});

test('any rank change trigger extends when supplier ranking changes', () => {
  const rfq = { ...baseRfq, extension_trigger_type: 'ANY_RANK_CHANGE' };
  const beforeRanked = rankBids([bid(1, 10, 500), bid(2, 11, 600)]);
  const afterRanked = rankBids([...beforeRanked, bid(3, 11, 450, '2026-04-22T10:55:00.000Z')]);
  const decision = getExtensionDecision({ rfq, submittedAt: '2026-04-22T10:55:00.000Z', beforeRanked, afterRanked });

  assert.equal(decision.shouldExtend, true);
});

test('L1 rank change trigger extends only when lowest supplier changes', () => {
  const rfq = { ...baseRfq, extension_trigger_type: 'L1_RANK_CHANGE' };
  const beforeRanked = rankBids([bid(1, 10, 500), bid(2, 11, 600)]);
  const afterRanked = rankBids([...beforeRanked, bid(3, 11, 450, '2026-04-22T10:55:00.000Z')]);
  const decision = getExtensionDecision({ rfq, submittedAt: '2026-04-22T10:55:00.000Z', beforeRanked, afterRanked });

  assert.equal(decision.shouldExtend, true);
});

test('L1 rank change trigger does not extend for first bid with no previous L1', () => {
  const rfq = { ...baseRfq, extension_trigger_type: 'L1_RANK_CHANGE' };
  const decision = getExtensionDecision({
    rfq,
    submittedAt: '2026-04-22T10:55:00.000Z',
    beforeRanked: [],
    afterRanked: rankBids([bid(1, 10, 500)])
  });

  assert.equal(decision.shouldExtend, false);
});
