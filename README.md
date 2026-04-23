# British Auction RFQ System

A full-stack RFQ application that supports British Auction style bidding. Buyers create RFQs, suppliers submit competitive quotes, rankings update by lowest total quote value, and auction close time can extend automatically when configured bidding activity happens near the deadline.

## Quick Links

| Document | Purpose |
| --- | --- |
| [Submission Document](./SUBMISSION_DOCUMENT.md) | Main evaluator-facing submission pack with requirement coverage, architecture, setup, demo, and verification results. |
| [High Level Design](./docs/HLD.md) | Architecture, components, request flow, and key technical decisions. |
| [Schema Design](./docs/SCHEMA.md) | Database entities, relationships, indexes, enums, and validation rules. |
| [API Reference](./docs/API.md) | Auth, health, RFQ, bid, log, and close-check endpoints. |
| [Demo Guide](./docs/DEMO_GUIDE.md) | Step-by-step evaluator walkthrough and test scenarios. |
| [Phase Plan](./PLAN.md) | Project implementation plan and phase notes. |

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL / Neon
- ORM: Prisma
- Auth: JWT cookie sessions
- API style: REST

## Core Features

- Buyer and supplier authentication.
- Buyer RFQ creation with British Auction configuration.
- Supplier quote submission with freight, origin, destination, transit time, and quote validity.
- Ranking table with L1, L2, L3 based on lowest total quote.
- Configurable extension triggers:
  - Bid received in last X minutes
  - Any supplier rank change in last X minutes
  - L1 bidder change in last X minutes
- Extension duration capped by forced close time.
- Activity timeline with bid submissions, close-time extensions, reasons, and status changes.
- Premium dark SaaS dashboard UI with live countdown and 10-second polling.

## Local Setup

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment

Create `backend/.env` from `backend/.env.example` and set:

```env
DATABASE_URL="postgresql://..."
CLIENT_ORIGIN="http://localhost:5173"
PORT=5001
JWT_SECRET="replace-this-secret"
```

Create `frontend/.env` if needed:

```env
VITE_API_BASE_URL="http://localhost:5001/api"
```

### 3. Prepare Database

```bash
cd backend
npm run deploy:migrate
npm run seed
```

For a full local reset instead:

```bash
cd backend
npm run setup:db
```

### 4. Run Application

From the repository root:

```bash
npm run dev:backend
npm run dev:frontend
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5001/api/health`
- Database health: `http://localhost:5001/api/health/db`

## Evaluator Flow

1. Sign up or log in as a buyer.
2. Create an RFQ with British Auction configuration.
3. Open the RFQ dashboard.
4. Log in as a supplier.
5. Submit supplier bids.
6. Open the RFQ detail page.
7. Review L1/L2 rankings, quote details, countdown, current close time, forced close time, auction rules, savings, and timeline logs.
8. Use close-check to verify closed/force-closed behavior.

## Verification

Backend tests:

```bash
cd backend
npm test
```

Frontend production build:

```bash
cd frontend
npm run build
```

Latest verification:

- Backend tests: 11 passing
- Frontend build: passing
- Known build warnings: Vite prints dependency-level `"use client"` warnings from React Router/Lucide. These do not fail the build.

## Repository Structure

```text
backend/
  prisma/
  src/
  test/
frontend/
  src/
docs/
  API.md
  DEMO_GUIDE.md
  HLD.md
  SCHEMA.md
  SUBMISSION_DOCUMENT.md
SUBMISSION_DOCUMENT.md
PLAN.md
README.md
```

## Assignment Deliverables

- [Submission document](./SUBMISSION_DOCUMENT.md)
- [High Level Design](./docs/HLD.md)
- [Schema Design](./docs/SCHEMA.md)
- [API Reference](./docs/API.md)
- [Verification / Demo Guide](./docs/DEMO_GUIDE.md)
- Backend code: [backend/](./backend)
- Frontend code: [frontend/](./frontend)
