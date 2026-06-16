# Folder Structure Documentation

## Root Structure
```
somlance/
├── mobile-somlance/   # React Native Expo Mobile App
├── admin/            # React Administrative Dashboard
├── backend/          # Node.js Express Backend
├── docs/             # Engineering Documentation
└── .env.example      # Environment variables template
```

## Mobile App Structure (`mobile/somlance/src/`)
We follow a **Feature-First Architecture** to ensure scalability and modularity.

- `app/`: Expo Router file-based routing.
- `features/`: Core business logic grouped by feature (e.g., `auth`, `projects`).
  - `api/`: Feature-specific API calls.
  - `hooks/`: Custom hooks for the feature.
  - `services/`: Business logic and data transformation.
  - `store/`: Local state management (Zustand).
  - `types/`: TypeScript definitions.
  - `validation/`: Zod schemas for the feature.
  - `constants/`: Feature-specific constants.
- `components/`: Global reusable UI components (Atomic Design).
- `hooks/`: Global shared React hooks.
- `services/`: Global services (e.g., storage, analytics).
- `api/`: Axios instances and global API configurations.
- `store/`: Global state management.
- `utils/`: Helper functions.
- `theme/`: Design system tokens (colors, typography).
- `providers/`: Context providers (QueryClient, Auth, etc.).
- `lib/`: Third-party library configurations.

## Admin Panel Structure (`admin/src/`)
Modular architecture for enterprise-grade management.

- `modules/`: Feature-based modules (e.g., `disputes`, `analytics`).
  - `api/`, `hooks/`, `services/`, `store/`, `validation/`, `types/`.
- `layouts/`: Global layout components (Sidebar, Topbar).
- `routes/`: Routing configuration.
- `providers/`: Global context providers.
- `services/`: Global API services.

## Backend Structure (`backend/src/`)
Layered architecture following the **Repository Pattern**.

- `modules/`: Domain-driven modules (e.g., `auth`, `escrow`).
- `controllers/`: Request handling and response orchestration.
- `services/`: Core business logic layer.
- `repositories/`: Database abstraction layer (Prisma).
- `routes/`: API endpoint definitions.
- `middleware/`: Authentication, logging, validation.
- `prisma/`: Database schema and migrations.
- `sockets/`: Socket.io event handlers.
- `validation/`: Centralized Express-validator schemas.
- `config/`: System configurations (DB, JWT, Cloud).
- `lib/`: Third-party library initializations.
