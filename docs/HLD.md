# High Level Design

## Architecture

```mermaid
flowchart LR
  Buyer[Buyer Demo Role] --> React[React + Vite Frontend]
  Supplier[Supplier Demo Role] --> React
  React -->|REST API| Express[Node + Express Backend]
  Express --> AuctionEngine[British Auction Engine]
  Express --> Postgres[(Neon PostgreSQL)]
  AuctionEngine --> Postgres
```

## Components

- React frontend handles RFQ creation, auction listing, detail view, role switching, and bid submission.
- Express backend exposes REST APIs and owns all validation.
- Auction engine calculates rankings, detects trigger conditions, and caps extensions at forced close.
- Neon PostgreSQL stores RFQs, suppliers, bids, and activity logs.

## API Flow

```mermaid
sequenceDiagram
  participant S as Supplier UI
  participant A as Express API
  participant E as Auction Engine
  participant D as PostgreSQL

  S->>A: POST /api/rfqs/:id/bids
  A->>D: Lock RFQ and read existing bids
  A->>D: Insert supplier and bid
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
