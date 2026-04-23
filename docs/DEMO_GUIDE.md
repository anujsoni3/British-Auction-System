# Demo Guide

## Purpose

This guide provides a clean evaluator walkthrough for the British Auction RFQ System.

Related documents:

- [Submission Document](../SUBMISSION_DOCUMENT.md)
- [High Level Design](./HLD.md)
- [Schema Design](./SCHEMA.md)
- [API Reference](./API.md)

## Pre-Demo Checklist

1. Database connection is configured in `backend/.env`.
2. Migrations are applied.
3. Backend server is running.
4. Frontend server is running.
5. Browser can open the frontend.

## Start Commands

From repository root, install dependencies:

```bash
npm run install:all
```

Prepare database:

```bash
cd backend
npm run deploy:migrate
npm run seed
```

Run backend:

```bash
npm run dev
```

Run frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## Suggested Demo Accounts

You can create these from the signup screen:

| Role | Name | Email |
| --- | --- | --- |
| Buyer | Test Buyer | `buyer@example.com` |
| Supplier | Atlas Supplier | `atlas@example.com` |
| Supplier | BlueLine Supplier | `blueline@example.com` |

Use any password that satisfies the app validation.

## Demo Flow

### 1. Buyer Login

1. Open `http://localhost:5173`.
2. Sign up or log in as a buyer.
3. Show the premium RFQ dashboard layout:
   - RFQ monitor sidebar
   - Live time
   - Metrics
   - Live countdown panel
   - Live auction cards

### 2. Create RFQ

1. Click `Create RFQ`.
2. Fill:
   - Reference ID
   - RFQ name
   - Bid start time
   - Bid close time
   - Forced close time
   - Pickup/service date
   - Trigger window
   - Extension duration
   - Trigger type
3. Submit.

Expected result:

- RFQ is created.
- Activity log contains RFQ creation.
- Buyer is redirected to RFQ detail page.

### 3. Verify Listing Page

Open the RFQ dashboard and confirm:

- RFQ name/reference is visible.
- Current lowest bid is visible when bids exist.
- Countdown or closed state is visible.
- Auction status is visible.
- Dashboard refresh mode states 10-second polling.

### 4. Supplier Bid

1. Log out.
2. Sign up or log in as a supplier.
3. Open the RFQ detail page.
4. Submit quote values:
   - Freight charges
   - Origin charges
   - Destination charges
   - Transit time
   - Quote validity

Expected result:

- Bid is accepted if auction is active.
- Ranking table updates.
- Supplier appears as L1 if it is the lowest bid.
- Timeline logs the bid.

### 5. Ranking Demonstration

1. Submit a lower quote from another supplier.
2. Open RFQ detail page.
3. Show:
   - L1/L2 ranking
   - Total quote price
   - Quote component columns
   - Submitted time

Expected result:

- Lower bid becomes L1.
- Previous L1 moves to L2.

### 6. Extension Demonstration

Use an RFQ close time near the current time and configure:

- Trigger window: `10`
- Extension duration: `5`
- Trigger type: `ANY_BID`, `ANY_RANK_CHANGE`, or `L1_CHANGE`

Submit a valid bid inside the trigger window.

Expected result:

- Current close time extends by configured minutes.
- Extension does not exceed forced close time.
- Timeline shows reason, such as:

```text
Extended by X min due to L1 change
```

### 7. Close Check

Log in as buyer and click `Run Close Check`.

Expected result:

- Auction status updates based on backend time.
- Possible statuses:
  - `ACTIVE`
  - `CLOSED`
  - `FORCE CLOSED`
- Status update appears in the timeline when changed.

## Verification Commands

Backend tests:

```bash
cd backend
npm test
```

Expected result:

```text
11 tests passed
```

Frontend build:

```bash
cd frontend
npm run build
```

Expected result:

```text
Build passed
```

## Evaluator Talking Points

- Forced close is the hard safety limit.
- Extension behavior is configurable per RFQ.
- Ranking is transparent and based on total quote price.
- Timeline logs explain bids, extensions, and status changes.
- Buyer sees business value through L1 supplier, lowest price, total bids, savings, and extension count.
- RFQ listing and detail pages use 10-second polling for fresh data.
