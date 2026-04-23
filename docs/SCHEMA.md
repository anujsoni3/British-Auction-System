# Schema Design

## `rfqs`

Stores British Auction RFQ configuration and current auction state.

Important columns:
- `referenceId`
- `name`
- `bidStartTime`
- `bidCloseTime`
- `forcedCloseTime`
- `pickupServiceDate`
- `triggerWindowMinutes`
- `extensionMinutes`
- `triggerType`
- `status`

Validation:
- forced close must be greater than original close.
- bid close must be less than or equal to forced close.
- extension trigger type must be `ANY_BID`, `ANY_RANK_CHANGE`, or `L1_CHANGE`.

## `suppliers`

Stores supplier/carrier names.

Important columns:
- `name`

## `bids`

Stores supplier quote submissions.

Important columns:
- `rfq_id`
- `supplier_id`
- `freight_charges`
- `origin_charges`
- `destination_charges`
- `price`
- `transit_time`
- `quote_validity`
- `createdAt`

Ranking:
- Bids are ordered by `price ASC, createdAt ASC`.

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
