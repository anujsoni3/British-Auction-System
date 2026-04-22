# API Reference

Base URL: `/rfq`

## Health

`GET /health`

Returns API health.

`GET /health/db`

Returns database connectivity status.

## RFQs

`POST /rfq`

Creates a British Auction RFQ.

Required body:

```json
{
  "referenceId": "RFQ-BA-1001",
  "name": "Mumbai to Delhi Linehaul",
  "bidStartTime": "2026-04-22T10:00",
  "bidCloseTime": "2026-04-22T11:00",
  "forcedCloseTime": "2026-04-22T12:00",
  "triggerWindowMinutes": 10,
  "extensionMinutes": 5,
  "triggerType": "ANY_BID"
}
```

`GET /rfq`

Returns auction listing data including lowest bid, current close, forced close, and status.

`GET /rfq/:id`

Returns RFQ details, sorted ranked bids, and activity logs.

`POST /rfq/:id/bid`

Submits a supplier quote.

Required body:

```json
{
  "supplierName": "Atlas Freight",
  "freightCharges": 25000,
  "originCharges": 3000,
  "destinationCharges": 3500,
  "transitTime": "3 days"
}
```

`GET /rfq/:id/logs`

Returns auction logs.

`POST /rfq/:id/close-check`

Refreshes the auction status using current time.
