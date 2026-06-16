# Kulmis Workforce Platform Architecture

Welcome to the Kulmis platform monorepo! This repository contains the code for the mobile app, admin dashboard, backend API, and the new **Business Web Dashboard**.

## Overview
Kulmis is an enterprise-grade workforce operations dashboard and remote staffing platform. It transitions the classic freelance marketplace into a managed B2B staffing platform where businesses can discover talent, issue contracts, manage payroll, and track attendance.

## Repository Structure

```text
kulmis/
├── backend/                  # Node.js, Express, Prisma (Core API)
├── admin/                    # React Admin Dashboard (Backoffice operations)
├── mobile-somlance/          # Expo React Native App (For Workers/Freelancers)
├── business-dashboard/       # React SPA (For B2B Clients / Businesses)
└── packages/
    └── shared-types/         # Shared TypeScript interfaces (Coming Soon)
```

## Business Dashboard Stack
The Business Dashboard relies on modern scalable React practices:
- **Frontend Framework**: React.js + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (Client state) & React Query (Server state)
- **Forms & Validation**: React Hook Form + Zod
- **Architecture**: Modular Feature-based Architecture (e.g., `src/features/payroll`)

## Feature-based Architecture
Each feature module encapsulates its own UI, hooks, API calls, and local state. Avoid cross-feature dependencies when possible. Use the `components` folder for generic/domain-agnostic components (like Buttons, Modals, Tables) and the `features/X/components` for domain-specific components.

### Example Flow: Payroll
1. **API**: `backend/src/routes/payroll.routes.ts` routes to `payroll.controller.ts` -> `payroll.service.ts` -> DB.
2. **Frontend Call**: `business-dashboard/src/features/payroll/api/getPayroll.ts` fetches from backend.
3. **Frontend Hook**: `business-dashboard/src/features/payroll/hooks/usePayrollQuery.ts` caches the data using React Query.
4. **Frontend View**: `business-dashboard/src/features/payroll/pages/PayrollOverviewPage.tsx` renders the data using generic table components.
