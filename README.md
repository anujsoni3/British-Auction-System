# British Auction RFQ System

A deployable PERN application for running British Auction style RFQs. Buyers create RFQs, suppliers submit open quotes, and the auction engine automatically extends close time when configured bidding activity happens near the deadline.

## Tech Stack

- PostgreSQL / Neon
- Node.js + Express
- React + Vite
- REST APIs
- Demo role switch for Buyer and Supplier flows

## Local Setup

Create a Neon PostgreSQL database first, then place the connection string in `backend/.env`.

```bash
cd backend
npm install
cp .env.example .env
npm run setup:db
npm run dev
```

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Demo Flow

1. Open the frontend and switch to Buyer.
2. Create an RFQ with British Auction configuration.
3. Switch to Supplier and submit bids.
4. Watch rankings, current close time, and the activity log update.

## Deployment

- Database: Neon PostgreSQL
- Backend: Render or Railway
- Frontend: Vercel or Netlify

Set the backend `DATABASE_URL`, `CLIENT_ORIGIN`, and `PORT`. Set the frontend `VITE_API_BASE_URL` to the deployed backend API URL.

### Render Backend

The repository includes `render.yaml`. Create a Render Blueprint or Web Service using `backend` as the root directory, then set:

- `DATABASE_URL`
- `CLIENT_ORIGIN`
- `PORT=5000`

Run the migration once after deployment:

```bash
npm run migrate
npm run seed
```

### Vercel Frontend

Use `frontend` as the project root and set:

- `VITE_API_BASE_URL=https://your-backend-url/api`

## Assignment Deliverables

- HLD: `docs/HLD.md`
- Schema design: `docs/SCHEMA.md`
- API reference: `docs/API.md`
- Demo guide: `docs/DEMO_GUIDE.md`
- Phase plan: `PLAN.md`
- Backend code: `backend/`
- Frontend code: `frontend/`
