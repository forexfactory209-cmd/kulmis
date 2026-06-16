# Mobile App Architecture

## Core Technologies
- **Framework**: React Native Expo (Managed Workflow)
- **Navigation**: Expo Router (File-based)
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Styling**: NativeWind (Tailwind CSS for React Native)

## Feature-First Strategy
The app is organized into features (e.g., `features/escrow`). Each feature is self-contained with its own API calls, hooks, and local state. This prevents "prop drilling" and makes features easy to move or reuse.

## Navigation Structure
- `(auth)/`: Authentication screens (Login, Signup).
- `(tabs)/`: Main navigation tabs for the user.
- `(drawer)/`: Secondary navigation for profile settings.
- `shared/`: Common screens (Project Details, Messaging).

## Data Fetching & Caching
- Use `useQuery` for GET requests.
- Use `useMutation` for POST/PUT/DELETE.
- Global cache management via `QueryClientProvider`.

## Offline Considerations
- Future integration of `AsyncStorage` for local persistence.
- Optimistic updates using React Query for a smoother UX.

## Styling Rules
- Use NativeWind for all layout and styling.
- Follow the design tokens defined in `src/theme/`.
- No inline styles allowed unless dynamically calculated.
