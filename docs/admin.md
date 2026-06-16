# Admin Panel Architecture

## Core Technologies
- **Framework**: React.js (TypeScript)
- **Routing**: React Router
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Styling**: Tailwind CSS

## Module Structure
The admin panel is divided into modules (e.g., `modules/disputes`). Each module manages its own data logic.

## Permission Structure
- **Super Admin**: Full access.
- **Support**: Access to disputes and reviews.
- **Analyst**: Access to analytics and transactions.

## Analytics Architecture
- Centralized `analytics` service to fetch dashboard metrics.
- Reusable chart components using libraries like Recharts.

## Scalability
- Code-splitting via `React.lazy` for module-based routing.
- Reusable UI elements for tables, forms, and modals.
