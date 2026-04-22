# Demo Guide

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

4. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Evaluator Walkthrough

1. Open the frontend and stay in Buyer role.
2. Create a British Auction RFQ.
3. Confirm the listing shows status, lowest bid, current close, forced close, and countdown.
4. Open the RFQ details page.
5. Switch to Supplier role.
6. Submit a quote and show L1/L2 rankings.
7. Use a near-close auction from seed data to demonstrate automatic extension.
8. Show the activity log entries for bid submission and time extension reason.
9. Click Run close check to demonstrate status refresh.

## Talking Points

- Forced close is the hard safety limit.
- Extension behavior is configurable per RFQ.
- Ranking is transparent and based on total quote price.
- Activity log gives auditability for the buyer.
