# British Auction RFQ System - Phase Plan

## Product Goal

Build a simplified RFQ platform where buyers can create British Auctions and suppliers compete transparently by submitting lower quotes. The system prevents last-second manipulation through configurable time extensions and a hard forced close.

## USP

- Transparent supplier ranking with L1, L2, L3 visibility.
- Configurable extension triggers for bid activity, any rank change, or L1 rank change.
- Forced close guarantee so auctions never run beyond the buyer-defined deadline.
- Server-rendered RFQ and supplier bidding flow for evaluator-friendly walkthroughs.
- Buyer savings summary showing L1 supplier, final price, total bids, extension count, and savings percentage.
- Deployable PERN architecture using Neon PostgreSQL.

## Core Features

- RFQ creation with British Auction configuration.
- Bid submission with freight, origin, destination, transit time, and validity.
- Automatic total price calculation.
- Live auction listing with lowest bid and close times.
- Auction detail page with rankings, quote details, configuration, business summary, and timeline log.
- Backend validation for forced close and bid eligibility.
- Sample data and rule checks for assignment verification.

## Technology Stack

- Frontend: EJS, Bootstrap.
- Backend: Node.js, Express, Prisma ORM, dotenv, CORS.
- Database: PostgreSQL hosted on Neon.
- Deployment: Vercel or Netlify for frontend; Render or Railway for backend.

## Phase Commits

1. `chore: initialize PERN british auction project`
2. `feat: add auction schema and core rfq api`
3. `feat: implement british auction extension rules`
4. `feat: build rfq creation and auction listing UI`
5. `feat: add supplier bidding and auction details page`
6. `docs: add hld schema and assignment deliverables`
7. `test: add sample data and auction rule checks`
8. `chore: prepare app for deployment`

## Testing Checklist

- Forced close must be greater than bid close.
- Bids before auction start are rejected.
- Bids after current close are rejected.
- Bids after forced close are rejected.
- Bid received inside trigger window extends auction.
- Bid outside trigger window does not extend auction.
- Extension is capped at forced close.
- Any supplier rank change can trigger extension.
- L1 rank change can trigger extension.
- Bids are sorted by total price ascending.

## Deployment Checklist

- Create Neon database and copy `DATABASE_URL`.
- Run backend migration and seed scripts.
- Deploy backend with `DATABASE_URL`, `PORT`, and `CLIENT_ORIGIN`.
- Deploy frontend with `VITE_API_BASE_URL`.
- Update README with live URLs after deployment.
