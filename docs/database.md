# Database Architecture

## Technology Stack
- **Database**: MySQL 8.0+
- **ORM**: Prisma

## Schema Overview
The database is highly normalized to ensure data integrity and scalability. All tables include `createdAt`, `updatedAt`, and `deletedAt` for soft-delete support.

### Core Models
- `User`: Central account management (Auth).
- `FreelancerProfile`: Detailed profile for freelancers (Bio, Rate, Availability).
- `ClientProfile`: Profile for clients/businesses.
- `Project`: Core entity for work listings.
- `Proposal`: Bids submitted by freelancers to projects.
- `EscrowPayment`: Financial holding for active projects.
- `Transaction`: Ledger for all financial movements.
- `Review`: Peer feedback system.
- `Conversation` & `Message`: Real-time chat system.

## Relationship Rules
- **One-to-One**: `User` to `FreelancerProfile`/`ClientProfile`.
- **One-to-Many**: `User` to `Projects`, `Project` to `Proposals`.
- **Many-to-Many**: `FreelancerProfile` to `Skills` (via join table).

## Indexing Strategy
- Unique indexes on `email` and `username`.
- Foreign key indexes on all relation IDs.
- Full-text search indexes on project titles and descriptions.

## Scaling Considerations
- Soft deletes are implemented using a `deletedAt` timestamp to preserve data history while excluding from active queries.
- Enums are used for status fields (e.g., `ProjectStatus`, `PaymentStatus`) for consistency.
