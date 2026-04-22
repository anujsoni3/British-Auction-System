# British Auction RFQ System

A deployable PERN application for running British Auction style RFQs. Buyers create RFQs, suppliers submit open quotes, and the auction engine automatically extends close time when configured bidding activity happens near the deadline.

## Tech Stack

- PostgreSQL / Neon
- Node.js + Express
- Prisma ORM
- EJS + Bootstrap
- REST APIs

## Local Setup

Create a Neon PostgreSQL database first, then place the connection string in `backend/.env`.

```bash
cd backend
npm install
cp .env.example .env
npm run setup:db
npm run dev
```

Open:

`http://localhost:5000/rfqs`

## Evaluator Flow

1. Create an RFQ with British Auction configuration.
2. Open RFQ details.
3. Submit supplier bids.
4. Watch rankings, current close time, countdown, and logs update.

## Deployment

- Database: Neon PostgreSQL
- Backend + EJS frontend: Render or Railway

Set the backend `DATABASE_URL`, `CLIENT_ORIGIN`, and `PORT`.

### Render Backend

The repository includes `render.yaml`. Create a Render Blueprint or Web Service using `backend` as the root directory, then set:

- `DATABASE_URL`
- `CLIENT_ORIGIN`
- `PORT=5000`

Run the migration once after deployment:

```bash
npm run deploy:migrate
npm run seed
```

## Assignment Deliverables

- HLD: `docs/HLD.md`
- Schema design: `docs/SCHEMA.md`
- API reference: `docs/API.md`
- Verification guide: `docs/DEMO_GUIDE.md`
- Phase plan: `PLAN.md`
- Backend code: `backend/`
- Frontend code: `frontend/`
