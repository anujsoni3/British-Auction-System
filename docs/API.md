# API Reference

## Purpose

This document describes the REST endpoints used by the British Auction RFQ System.

Related documents:

- [Submission Document](../SUBMISSION_DOCUMENT.md)
- [High Level Design](./HLD.md)
- [Schema Design](./SCHEMA.md)
- [Demo Guide](./DEMO_GUIDE.md)

## Base URLs

Local backend:

```text
http://localhost:5001
```

RFQ API base:

```text
/api/rfqs
```

Authentication uses HTTP-only cookies. Protected RFQ actions require an authenticated user.

## Health

### `GET /api/health`

Returns API health.

Example response:

```json
{
  "ok": true
}
```

### `GET /api/health/db`

Returns database connectivity status.

## Auth

### `POST /auth/signup`

Creates a user account and starts a session.

Request:

```json
{
  "name": "Test Buyer",
  "email": "buyer@example.com",
  "password": "password123",
  "role": "BUYER"
}
```

Roles:

- `BUYER`
- `SUPPLIER`

### `POST /auth/login`

Logs in an existing user.

Request:

```json
{
  "email": "buyer@example.com",
  "password": "password123"
}
```

### `GET /auth/me`

Returns the current authenticated user.

### `POST /auth/logout`

Clears the current session.

## RFQs

### `POST /api/rfqs`

Creates a British Auction RFQ. Requires a buyer user.

Request:

```json
{
  "referenceId": "RFQ-BA-1001",
  "name": "Mumbai to Delhi Linehaul",
  "bidStartTime": "2026-04-23T10:00",
  "bidCloseTime": "2026-04-23T11:00",
  "forcedCloseTime": "2026-04-23T12:00",
  "pickupServiceDate": "2026-04-24T09:00",
  "triggerWindowMinutes": 10,
  "extensionMinutes": 5,
  "triggerType": "ANY_BID"
}
```

Allowed `triggerType` values:

- `ANY_BID`
- `ANY_RANK_CHANGE`
- `L1_CHANGE`

Validation:

- `referenceId` is required.
- `name` is required.
- `bidStartTime < bidCloseTime`.
- `forcedCloseTime > bidCloseTime`.
- `triggerWindowMinutes` and `extensionMinutes` must be positive integers.

### `GET /api/rfqs`

Returns RFQ listing data.

Includes:

- RFQ identity and status
- Current close time
- Forced close time
- Current lowest bid
- Bid count
- Extension count

### `GET /api/rfqs/:id`

Returns RFQ detail data.

Includes:

- `rfq`
- `bids`
- `rankings`
- `logs`
- `summary`

Summary includes:

- L1 supplier
- Final/current lowest price
- First bid price
- Total bids
- Extension count
- Savings amount
- Savings percentage

## Bids

### `POST /api/rfqs/:id/bids`

Submits a supplier quote. Requires a supplier user.

Request:

```json
{
  "freightCharges": 25000,
  "originCharges": 3000,
  "destinationCharges": 3500,
  "transitTime": "3 days",
  "quoteValidity": "7 days from bid date"
}
```

Backend behavior:

- Calculates total bid price.
- Rejects bid if auction is not active.
- Rejects bid if it is not lower than current lowest bid.
- Recalculates rankings.
- Applies configured extension logic when applicable.
- Writes activity logs.

### `POST /api/rfqs/:id/bid`

Compatibility alias for supplier bid submission.

## Logs

### `GET /api/rfqs/:id/logs`

Returns activity logs for an RFQ.

Log event types:

- `RFQ_CREATED`
- `BID_PLACED`
- `AUCTION_EXTENDED`
- `STATUS_UPDATED`

## Close Check

### `POST /api/rfqs/:id/close-check`

Refreshes auction status using backend time.

Possible statuses:

- `SCHEDULED`
- `ACTIVE`
- `CLOSED`
- `FORCE_CLOSED`

## Error Format

Errors are returned as JSON:

```json
{
  "error": "Forced Close Time must be greater than Bid Close Time"
}
```
