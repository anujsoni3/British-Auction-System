# Schema Design

## `rfqs`

Stores British Auction RFQ configuration and current auction state.

Important columns:
- `reference_id`
- `name`
- `bid_start_time`
- `original_bid_close_time`
- `current_bid_close_time`
- `forced_bid_close_time`
- `pickup_service_date`
- `trigger_window_minutes`
- `extension_duration_minutes`
- `extension_trigger_type`
- `status`

Validation:
- forced close must be greater than original close.
- current close must be less than or equal to forced close.
- extension trigger type must be `BID_RECEIVED`, `ANY_RANK_CHANGE`, or `L1_RANK_CHANGE`.

## `suppliers`

Stores demo supplier/carrier names.

Important columns:
- `carrier_name`

## `bids`

Stores supplier quote submissions.

Important columns:
- `rfq_id`
- `supplier_id`
- `freight_charges`
- `origin_charges`
- `destination_charges`
- `total_price`
- `transit_time`
- `quote_validity`
- `submitted_at`

Ranking:
- Bids are ordered by `total_price ASC, submitted_at ASC`.

## `auction_activity_logs`

Stores the audit trail.

Important columns:
- `rfq_id`
- `activity_type`
- `message`
- `previous_close_time`
- `new_close_time`
- `created_at`

## Indexes

- `idx_rfqs_status`
- `idx_bids_rfq_total`
- `idx_logs_rfq_created`
