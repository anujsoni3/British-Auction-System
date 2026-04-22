import { Router } from 'express';
import { pool } from '../db/pool.js';
import { calculateTotalPrice, EXTENSION_TRIGGERS, getExtensionDecision, rankBids, resolveStatus } from '../services/auctionService.js';

const router = Router();

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function refreshStatus(client, rfq) {
  const status = resolveStatus(rfq);
  if (status !== rfq.status) {
    await client.query('UPDATE rfqs SET status = $1, updated_at = NOW() WHERE id = $2', [status, rfq.id]);
  }
  return status;
}

async function fetchBids(client, rfqId) {
  const result = await client.query(
    `SELECT b.*, s.carrier_name
     FROM bids b
     JOIN suppliers s ON s.id = b.supplier_id
     WHERE b.rfq_id = $1
     ORDER BY b.total_price ASC, b.submitted_at ASC`,
    [rfqId]
  );
  return result.rows;
}

router.post('/', async (req, res, next) => {
  try {
    const {
      referenceId,
      name,
      bidStartTime,
      bidCloseTime,
      forcedBidCloseTime,
      pickupServiceDate,
      triggerWindowMinutes,
      extensionDurationMinutes,
      extensionTriggerType
    } = req.body;

    if (!referenceId || !name || !bidStartTime || !bidCloseTime || !forcedBidCloseTime || !pickupServiceDate) {
      throw badRequest('Missing required RFQ fields');
    }
    if (!EXTENSION_TRIGGERS.includes(extensionTriggerType)) {
      throw badRequest('Invalid extension trigger type');
    }
    if (new Date(forcedBidCloseTime) <= new Date(bidCloseTime)) {
      throw badRequest('Forced Bid Close Time must be greater than Bid Close Time');
    }

    const status = resolveStatus({
      bid_start_time: bidStartTime,
      current_bid_close_time: bidCloseTime,
      forced_bid_close_time: forcedBidCloseTime
    });

    const result = await pool.query(
      `INSERT INTO rfqs
       (reference_id, name, bid_start_time, original_bid_close_time, current_bid_close_time, forced_bid_close_time, pickup_service_date, trigger_window_minutes, extension_duration_minutes, extension_trigger_type, status)
       VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [referenceId, name, bidStartTime, bidCloseTime, forcedBidCloseTime, pickupServiceDate, triggerWindowMinutes, extensionDurationMinutes, extensionTriggerType, status]
    );

    await pool.query(
      `INSERT INTO auction_activity_logs (rfq_id, activity_type, message)
       VALUES ($1, 'RFQ_CREATED', $2)`,
      [result.rows[0].id, `RFQ ${referenceId} created with ${extensionTriggerType} trigger`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (_req, res, next) => {
  const client = await pool.connect();
  try {
    const rfqs = await client.query('SELECT * FROM rfqs ORDER BY created_at DESC');
    const rows = [];
    for (const rfq of rfqs.rows) {
      const status = await refreshStatus(client, rfq);
      const lowest = await client.query('SELECT MIN(total_price) AS current_lowest_bid FROM bids WHERE rfq_id = $1', [rfq.id]);
      rows.push({ ...rfq, status, current_lowest_bid: lowest.rows[0].current_lowest_bid });
    }
    res.json(rows);
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
});

router.get('/:id', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const rfqResult = await client.query('SELECT * FROM rfqs WHERE id = $1', [req.params.id]);
    if (!rfqResult.rows[0]) return res.status(404).json({ error: 'RFQ not found' });
    const rfq = rfqResult.rows[0];
    const status = await refreshStatus(client, rfq);
    const bids = rankBids(await fetchBids(client, rfq.id));
    const logs = await client.query('SELECT * FROM auction_activity_logs WHERE rfq_id = $1 ORDER BY created_at DESC', [rfq.id]);
    res.json({ rfq: { ...rfq, status }, bids, activityLogs: logs.rows });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
});

router.post('/:id/bids', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const rfqResult = await client.query('SELECT * FROM rfqs WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (!rfqResult.rows[0]) throw badRequest('RFQ not found');
    const rfq = rfqResult.rows[0];
    const status = resolveStatus(rfq);
    if (status !== 'Active') throw badRequest(`Auction is ${status}; bids are not allowed`);

    const { carrierName, freightCharges, originCharges, destinationCharges, transitTime, quoteValidity } = req.body;
    if (!carrierName || !transitTime || !quoteValidity) throw badRequest('Missing required bid fields');

    const totalPrice = calculateTotalPrice({ freightCharges, originCharges, destinationCharges });
    if (!Number.isFinite(totalPrice) || totalPrice < 0) throw badRequest('Charges must be valid positive numbers');

    const beforeRanked = rankBids(await fetchBids(client, rfq.id));
    const supplier = await client.query(
      `INSERT INTO suppliers (carrier_name) VALUES ($1)
       ON CONFLICT (carrier_name) DO UPDATE SET carrier_name = EXCLUDED.carrier_name
       RETURNING id, carrier_name`,
      [carrierName]
    );

    const bidResult = await client.query(
      `INSERT INTO bids
       (rfq_id, supplier_id, freight_charges, origin_charges, destination_charges, total_price, transit_time, quote_validity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [rfq.id, supplier.rows[0].id, freightCharges, originCharges, destinationCharges, totalPrice, transitTime, quoteValidity]
    );

    const afterRanked = rankBids(await fetchBids(client, rfq.id));
    await client.query(
      `INSERT INTO auction_activity_logs (rfq_id, activity_type, message)
       VALUES ($1,'BID_SUBMITTED',$2)`,
      [rfq.id, `${carrierName} submitted a bid of ${totalPrice.toFixed(2)}`]
    );

    const decision = getExtensionDecision({
      rfq,
      submittedAt: bidResult.rows[0].submitted_at,
      beforeRanked,
      afterRanked
    });

    if (decision.shouldExtend) {
      await client.query('UPDATE rfqs SET current_bid_close_time = $1, updated_at = NOW() WHERE id = $2', [decision.newCloseTime, rfq.id]);
      await client.query(
        `INSERT INTO auction_activity_logs (rfq_id, activity_type, message, previous_close_time, new_close_time)
         VALUES ($1,'TIME_EXTENDED',$2,$3,$4)`,
        [rfq.id, `${decision.reason} because of ${carrierName}'s bid`, decision.previousCloseTime, decision.newCloseTime]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ bid: bidResult.rows[0], extension: decision });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

router.post('/:id/close-check', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const rfqResult = await client.query('SELECT * FROM rfqs WHERE id = $1', [req.params.id]);
    if (!rfqResult.rows[0]) return res.status(404).json({ error: 'RFQ not found' });
    const status = await refreshStatus(client, rfqResult.rows[0]);
    res.json({ id: Number(req.params.id), status });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
});

export default router;
