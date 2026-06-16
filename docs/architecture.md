# System Architecture

## Overview
Somlance uses a decoupled architecture with a centralized Node.js backend serving both a mobile application (Expo) and an administrative dashboard (React).

## Communication Flow
1. **Frontend to Backend**: RESTful API (v1) via Axios.
2. **Real-time Updates**: WebSockets (Socket.io) for messaging, notifications, and project status updates.
3. **Database**: MySQL managed via Prisma ORM for type-safe queries.

## Authentication Flow
1. User logs in/registers.
2. Backend validates credentials and issues:
   - `AccessToken`: Short-lived JWT (15m) for API calls.
   - `RefreshToken`: Long-lived token (7d) stored securely for session persistence.
3. Role-Based Access Control (RBAC) ensures only authorized roles (ADMIN, FREELANCER, CLIENT) access specific resources.

## Scalability Strategy
- **Horizontal Scaling**: Stateless backend allows running multiple instances behind a load balancer.
- **Caching**: Future implementation of Redis for frequently accessed data (e.g., freelancer profiles).
- **Database Indexing**: Critical fields (emails, UUIDs, status) are indexed for performance.

## Real-time Flow
- `Connection`: Clients connect via Socket.io with JWT authentication.
- `Rooms`: Users are joined to private rooms (user ID) and group rooms (conversation ID).
- `Events`: Standardized event naming (e.g., `message:new`, `notification:received`).
