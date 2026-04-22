export const EXTENSION_TRIGGERS = ['BID_RECEIVED', 'ANY_RANK_CHANGE', 'L1_RANK_CHANGE'];

export function calculateTotalPrice({ freightCharges, originCharges, destinationCharges }) {
  return Number(freightCharges) + Number(originCharges) + Number(destinationCharges);
}

export function resolveStatus(rfq, now = new Date()) {
  const start = new Date(rfq.bid_start_time);
  const close = new Date(rfq.current_bid_close_time);
  const forced = new Date(rfq.forced_bid_close_time);

  if (now >= forced) return 'Force Closed';
  if (now > close) return 'Closed';
  if (now < start) return 'Scheduled';
  return 'Active';
}

export function rankBids(bids) {
  return [...bids]
    .sort((a, b) => Number(a.total_price) - Number(b.total_price) || new Date(a.submitted_at) - new Date(b.submitted_at))
    .map((bid, index) => ({ ...bid, rank: `L${index + 1}` }));
}

export function rankingMap(rankedBids) {
  const map = new Map();
  for (const bid of rankedBids) {
    if (!map.has(bid.supplier_id)) {
      map.set(bid.supplier_id, bid.rank);
    }
  }
  return map;
}

export function didAnyRankChange(beforeRanked, afterRanked) {
  const before = rankingMap(beforeRanked);
  const after = rankingMap(afterRanked);
  for (const [supplierId, rank] of after.entries()) {
    if (before.get(supplierId) !== rank) return true;
  }
  return false;
}

export function didL1Change(beforeRanked, afterRanked) {
  if (!beforeRanked[0] || !afterRanked[0]) return false;
  return beforeRanked[0].supplier_id !== afterRanked[0].supplier_id;
}

export function getExtensionDecision({ rfq, submittedAt, beforeRanked, afterRanked }) {
  const submitted = new Date(submittedAt);
  const currentClose = new Date(rfq.current_bid_close_time);
  const forcedClose = new Date(rfq.forced_bid_close_time);
  const windowStart = new Date(currentClose.getTime() - Number(rfq.trigger_window_minutes) * 60000);
  const inTriggerWindow = submitted >= windowStart && submitted <= currentClose;

  if (!inTriggerWindow) {
    return { shouldExtend: false, reason: 'Bid was outside trigger window' };
  }

  let triggered = false;
  let reason = '';

  if (rfq.extension_trigger_type === 'BID_RECEIVED') {
    triggered = true;
    reason = 'Bid received in last trigger window';
  }

  if (rfq.extension_trigger_type === 'ANY_RANK_CHANGE') {
    triggered = didAnyRankChange(beforeRanked, afterRanked);
    reason = triggered ? 'Supplier ranking changed in trigger window' : 'No supplier ranking changed';
  }

  if (rfq.extension_trigger_type === 'L1_RANK_CHANGE') {
    triggered = didL1Change(beforeRanked, afterRanked);
    reason = triggered ? 'Lowest bidder changed in trigger window' : 'Lowest bidder did not change';
  }

  if (!triggered) return { shouldExtend: false, reason };

  const requestedClose = new Date(currentClose.getTime() + Number(rfq.extension_duration_minutes) * 60000);
  const newClose = requestedClose > forcedClose ? forcedClose : requestedClose;

  if (newClose.getTime() === currentClose.getTime()) {
    return { shouldExtend: false, reason: 'Forced close already reached as extension limit' };
  }

  return {
    shouldExtend: true,
    reason,
    previousCloseTime: currentClose.toISOString(),
    newCloseTime: newClose.toISOString()
  };
}
