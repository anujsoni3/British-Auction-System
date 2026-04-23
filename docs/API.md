# API Reference

Base URL: `/api/rfqs`

## Health

`GET /health`

Returns API health.

`GET /api/health/db`

Returns database connectivity status.

## RFQs

`POST /api/rfqs`

Creates a British Auction RFQ.

Required body:

```json
{
  "referenceId": "RFQ-BA-1001",
  "name": "Mumbai to Delhi Linehaul",
  "bidStartTime": "2026-04-22T10:00",
  "bidCloseTime": "2026-04-22T11:00",
  "forcedCloseTime": "2026-04-22T12:00",
  "pickupServiceDate": "2026-04-23T09:00",
  "triggerWindowMinutes": 10,
  "extensionMinutes": 5,
  "triggerType": "ANY_BID"
}
```

`GET /api/rfqs`

Returns auction listing data including lowest bid, current close, forced close, and status.

`GET /api/rfqs/:id`

Returns RFQ details, sorted ranked bids, and activity logs.

`POST /api/rfqs/:id/bid`

Submits a supplier quote.

Required body:

```json
{
  "freightCharges": 25000,
  "originCharges": 3000,
  "destinationCharges": 3500,
  "transitTime": "3 days",
  "quoteValidity": "7 days from bid date"
}
```

`POST /api/rfqs/:id/bids`

Alias endpoint for supplier bid submission.

`GET /api/rfqs/:id/logs`

Returns auction logs.

`POST /api/rfqs/:id/close-check`

Refreshes the auction status using current time.
