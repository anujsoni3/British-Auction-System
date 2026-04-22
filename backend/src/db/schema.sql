CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  carrier_name VARCHAR(160) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rfqs (
  id SERIAL PRIMARY KEY,
  reference_id VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  bid_start_time TIMESTAMPTZ NOT NULL,
  original_bid_close_time TIMESTAMPTZ NOT NULL,
  current_bid_close_time TIMESTAMPTZ NOT NULL,
  forced_bid_close_time TIMESTAMPTZ NOT NULL,
  pickup_service_date DATE NOT NULL,
  trigger_window_minutes INTEGER NOT NULL CHECK (trigger_window_minutes > 0),
  extension_duration_minutes INTEGER NOT NULL CHECK (extension_duration_minutes > 0),
  extension_trigger_type VARCHAR(32) NOT NULL CHECK (extension_trigger_type IN ('BID_RECEIVED', 'ANY_RANK_CHANGE', 'L1_RANK_CHANGE')),
  status VARCHAR(24) NOT NULL DEFAULT 'Active' CHECK (status IN ('Scheduled', 'Active', 'Closed', 'Force Closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (forced_bid_close_time > original_bid_close_time),
  CHECK (current_bid_close_time <= forced_bid_close_time)
);

CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  rfq_id INTEGER NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  freight_charges NUMERIC(12, 2) NOT NULL CHECK (freight_charges >= 0),
  origin_charges NUMERIC(12, 2) NOT NULL CHECK (origin_charges >= 0),
  destination_charges NUMERIC(12, 2) NOT NULL CHECK (destination_charges >= 0),
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
  transit_time VARCHAR(80) NOT NULL,
  quote_validity DATE NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auction_activity_logs (
  id SERIAL PRIMARY KEY,
  rfq_id INTEGER NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  activity_type VARCHAR(40) NOT NULL,
  message TEXT NOT NULL,
  previous_close_time TIMESTAMPTZ,
  new_close_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_bids_rfq_total ON bids(rfq_id, total_price ASC, submitted_at ASC);
CREATE INDEX IF NOT EXISTS idx_logs_rfq_created ON auction_activity_logs(rfq_id, created_at DESC);
