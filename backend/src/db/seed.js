import { pool } from './pool.js';

const now = new Date();
const minutesFromNow = (minutes) => new Date(now.getTime() + minutes * 60000).toISOString();
const dateFromNow = (days) => new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);

async function main() {
  await pool.query('DELETE FROM auction_activity_logs');
  await pool.query('DELETE FROM bids');
  await pool.query('DELETE FROM rfqs');
  await pool.query('DELETE FROM suppliers');

  const suppliers = ['Atlas Freight', 'BlueLine Logistics', 'CargoSwift'];
  for (const carrier of suppliers) {
    await pool.query('INSERT INTO suppliers (carrier_name) VALUES ($1)', [carrier]);
  }

  const rfqOne = await pool.query(
    `INSERT INTO rfqs
      (reference_id, name, bid_start_time, original_bid_close_time, current_bid_close_time, forced_bid_close_time, pickup_service_date, trigger_window_minutes, extension_duration_minutes, extension_trigger_type, status)
     VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$8,$9,'Active')
     RETURNING id`,
    ['RFQ-BA-1001', 'Mumbai to Delhi Linehaul', minutesFromNow(-60), minutesFromNow(40), minutesFromNow(90), dateFromNow(4), 10, 5, 'BID_RECEIVED']
  );

  const rfqTwo = await pool.query(
    `INSERT INTO rfqs
      (reference_id, name, bid_start_time, original_bid_close_time, current_bid_close_time, forced_bid_close_time, pickup_service_date, trigger_window_minutes, extension_duration_minutes, extension_trigger_type, status)
     VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$8,$9,'Active')
     RETURNING id`,
    ['RFQ-BA-1002', 'Pune Export Container Pickup', minutesFromNow(-30), minutesFromNow(6), minutesFromNow(20), dateFromNow(2), 10, 5, 'L1_RANK_CHANGE']
  );

  const supplierRows = await pool.query('SELECT id, carrier_name FROM suppliers ORDER BY id');
  const sampleBids = [
    [rfqOne.rows[0].id, supplierRows.rows[0].id, 45000, 6000, 7000, '3 days', dateFromNow(10)],
    [rfqOne.rows[0].id, supplierRows.rows[1].id, 43000, 5500, 6500, '4 days', dateFromNow(9)],
    [rfqTwo.rows[0].id, supplierRows.rows[2].id, 25000, 3200, 4100, '2 days', dateFromNow(7)]
  ];

  for (const bid of sampleBids) {
    const total = Number(bid[2]) + Number(bid[3]) + Number(bid[4]);
    await pool.query(
      `INSERT INTO bids (rfq_id, supplier_id, freight_charges, origin_charges, destination_charges, total_price, transit_time, quote_validity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [...bid.slice(0, 5), total, bid[5], bid[6]]
    );
  }

  await pool.query(
    `INSERT INTO auction_activity_logs (rfq_id, activity_type, message)
     VALUES ($1,'RFQ_CREATED','Demo RFQ created with seeded bids'), ($2,'RFQ_CREATED','Near-close demo RFQ created')`,
    [rfqOne.rows[0].id, rfqTwo.rows[0].id]
  );
}

await main();
await pool.end();
console.log('Demo data seeded.');
