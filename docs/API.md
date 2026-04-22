# API Reference

Base URL: `/api`

## Health

`GET /health`

Returns API health.

`GET /health/db`

Returns database connectivity status.

## RFQs

`POST /rfqs`

Creates a British Auction RFQ.

Required body:

```json
{
  "referenceId": "RFQ-BA-1001",
  "name": "Mumbai to Delhi Linehaul",
  "bidStartTime": "2026-04-22T10:00",
  "bidCloseTime": "2026-04-22T11:00",
  "forcedBidCloseTime": "2026-04-22T12:00",
  "pickupServiceDate": "2026-04-25",
  "triggerWindowMinutes": 10,
  "extensionDurationMinutes": 5,
  "extensionTriggerType": "BID_RECEIVED"
}
```

`GET /rfqs`

Returns auction listing data including lowest bid, current close, forced close, and status.

`GET /rfqs/:id`

Returns RFQ details, sorted ranked bids, and activity logs.

`POST /rfqs/:id/bids`

Submits a supplier quote.

Required body:

```json
{
  "carrierName": "Atlas Freight",
  "freightCharges": 25000,
  "originCharges": 3000,
  "destinationCharges": 3500,
  "transitTime": "3 days",
  "quoteValidity": "2026-04-30"
}
```

`POST /rfqs/:id/close-check`

Refreshes the auction status using current time.
