# Backend Engineering Standards

## Layered Architecture
Each request flows through the following layers:
1. **Route Layer**: Endpoint definition and middleware application.
2. **Controller Layer**: Request validation, parameter extraction, and response formatting.
3. **Service Layer**: Business logic and orchestration of repositories.
4. **Repository Layer**: Direct database interaction via Prisma.

## Coding Standards
- **Language**: Strict TypeScript.
- **Async/Await**: Use try-catch blocks in controllers or a global error handler wrapper.
- **Variable Naming**: camelCase for variables/functions, PascalCase for classes/types.
- **Environment Variables**: Managed via `dotenv` and a centralized `config.ts`.

## Validation Rules
- All incoming requests must be validated using `express-validator`.
- Validation schemas are located in `src/validation/`.

## Authentication Flow
1. Middleware `authMiddleware` verifies JWT.
2. Role-based middleware `checkRole(['ADMIN', 'FREELANCER'])` verifies permissions.
3. Decoded user payload is attached to the `req.user` object.

## Security Standards
- Password hashing using `bcrypt` (12 salt rounds).
- JWT signed with `RS256` or `HS256` (configured in env).
- CORS enabled for mobile and admin domains.
- Helmet for basic security headers.
- Rate limiting for auth and sensitive endpoints.
