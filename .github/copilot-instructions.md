# GitHub Copilot Instructions

## Project Overview
This is a Constitutional Tender Sovereign Web Terminal - a monorepo containing a NestJS API and Next.js web application for financial operations.

## Technology Stack
- **Monorepo**: Turborepo
- **Backend**: NestJS 10.4, TypeScript 5.7
- **Frontend**: Next.js 15.1, React 19, TypeScript 5.7
- **Database**: PostgreSQL with Prisma 6.3
- **Authentication**: Auth0 with JWT (RS256)
- **Styling**: Tailwind CSS

## Architecture Patterns

### NestJS Backend (apps/api)
- Follow NestJS module pattern: `controller.ts`, `service.ts`, `module.ts`
- Use PrismaService at root AppModule level, not in child modules
- Protected routes use `@UseGuards(JwtAuthGuard)`
- Public routes use `@Public()` decorator
- Extract user context with `@CurrentUser()` decorator returning `UserFromToken`

### Authentication
- Auth0 JWT with RS256 algorithm
- Hybrid permission storage: JWT for basic RBAC (fast), database for complex permissions
- Required scopes: openid, profile, email, read:trades, write:trades, read:holdings
- Environment vars: `NEXT_PUBLIC_AUTH0_DOMAIN`, `NEXT_PUBLIC_AUTH0_CLIENT_ID`, `NEXT_PUBLIC_AUTH0_AUDIENCE`, `NEXT_PUBLIC_API_URL`

### Frontend (apps/web)
- Auth0ProviderWrapper wraps app in layout.tsx
- Use `useAuth0()` hook for auth state
- Use `useApi()` hook for authenticated API calls
- API endpoint: http://localhost:4000

### Database Schema
- Payment system: BankAccount, WireTransfer, CryptoPayment tables
- All linked to User via foreign keys
- Uses PaymentStatus and PaymentMethod enums
- Run migrations: `npx prisma migrate dev --name migration_name` from apps/api directory

## Coding Standards

### General
- Use TypeScript strict mode
- Follow existing code style and patterns
- Write clear, self-documenting code
- Add comments only when necessary to explain complex logic

### NestJS/Backend
- Use dependency injection
- Implement proper error handling
- Use DTOs for validation
- Follow RESTful principles
- Implement proper logging

### Next.js/Frontend
- Use React 19 features appropriately
- Implement proper error boundaries
- Use server components where appropriate
- Follow component composition patterns
- Ensure accessibility standards

### Security
- Never commit secrets or credentials
- Use environment variables for configuration
- Implement proper input validation
- Use parameterized queries (Prisma handles this)
- Follow OWASP security guidelines

## Development Workflow
- Work in feature branches
- Write meaningful commit messages
- Test changes before committing
- Keep changes focused and atomic
- Update documentation as needed

## Testing
- Write tests for new features
- Ensure existing tests pass
- Focus on critical paths
- Use appropriate testing levels (unit, integration, e2e)

## Commands
- Build: `npm run build` (from root or specific app)
- Dev: `npm run dev` (from root for all apps)
- Test: `npm run test` (from specific app directory)
- Migrations: `npx prisma migrate dev` (from apps/api)
- Generate Prisma Client: `npx prisma generate` (from apps/api)

## Current State
- Authentication is production-ready
- Payment tables are implemented
- Frontend integrated with Auth0
- Trading services are stubs (work in progress)
- Testing infrastructure needs development

## Priorities
1. Maintain security best practices
2. Follow established patterns
3. Keep code maintainable
4. Document significant changes
5. Consider performance implications
