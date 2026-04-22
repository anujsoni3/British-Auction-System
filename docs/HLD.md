# High Level Design

## Architecture

```mermaid
flowchart LR
  Buyer[Buyer] --> EJS[EJS + Bootstrap Frontend]
  Supplier[Supplier] --> EJS
  EJS --> Express[Node + Express Backend]
  Client[API Client] -->|REST API| Express
  Express --> AuctionEngine[British Auction Engine]
  Express --> Prisma[Prisma ORM]
  Prisma --> Postgres[(Neon PostgreSQL)]
  AuctionEngine --> Postgres
```

## Components

- EJS + Bootstrap frontend handles RFQ creation, listing, details, bid submission, rankings, countdown, and logs.
- Express backend exposes REST APIs and owns all validation.
- Prisma ORM manages database access and migrations.
- Auction engine calculates rankings, detects trigger conditions, and caps extensions at forced close.
- Neon PostgreSQL stores RFQs, suppliers, bids, and activity logs.

## API Flow

```mermaid
sequenceDiagram
  participant S as Supplier UI
  participant A as Express API
  participant E as Auction Engine
  participant D as PostgreSQL

  S->>A: POST /rfq/:id/bid
  A->>D: Read RFQ and existing bids
  A->>D: Insert supplier and bid through Prisma
  A->>E: Compare before/after ranking
  E-->>A: Extension decision
  A->>D: Update close time and write logs
  A-->>S: Bid result and extension status
```

## Key Rules

- `forced_bid_close_time` must be greater than the original bid close time.
- `current_bid_close_time` must never exceed forced close.
- Rank is based on lowest total quote price.
- Activity logs are the audit trail for bid submissions and time extensions.
