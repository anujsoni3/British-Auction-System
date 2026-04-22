# Verification Guide

## Preparation

1. Create a Neon PostgreSQL database.
2. Copy the connection string into `backend/.env` as `DATABASE_URL`.
3. Run:

```bash
cd backend
npm install
npm run setup:db
npm run dev
```

## Evaluator Walkthrough

1. Open `http://localhost:5000/rfqs`.
2. Create a British Auction RFQ.
3. Confirm the listing shows status, lowest bid, bid close, forced close, and countdown.
4. Open the RFQ details page.
5. Submit a supplier quote and show L1/L2 rankings.
6. Use a near-close auction from sample data to verify automatic extension.
7. Show the activity log entries for bid placement and time extension reason.

## Talking Points

- Forced close is the hard safety limit.
- Extension behavior is configurable per RFQ.
- Ranking is transparent and based on total quote price.
- Activity log gives auditability for the buyer.
