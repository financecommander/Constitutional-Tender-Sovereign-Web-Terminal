# Constitutional Tender Sovereign Web Terminal

A web-based platform for trading and managing allocated precious metals across international vault locations.

## 🏗️ Project Status

**Development Stage:** Early Development  
**Status:** Foundation Complete, Core Features In Progress  

For a comprehensive architectural review and status report, see [ARCHITECTURAL_REVIEW.md](./ARCHITECTURAL_REVIEW.md)

## 📋 Quick Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Authentication | ✅ Production Ready | Auth0 JWT with RS256 |
| Database Schema | ✅ Complete | Prisma with PostgreSQL |
| Trading API | 🟡 In Progress | Controllers built, services needed |
| Frontend UI | 🟡 In Progress | Components built, API integration needed |
| Testing | ❌ Not Started | Test infrastructure needed |
| Documentation | 🟡 Partial | Excellent auth docs, project docs needed |

## 🚀 Technology Stack

### Backend (API)
- **Framework:** NestJS 10.4
- **Language:** TypeScript 5.7
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Auth0 + Passport JWT (RS256)
- **Runtime:** Node.js 18+

### Frontend (Web)
- **Framework:** Next.js 15.1 (App Router)
- **Language:** TypeScript 5.7
- **UI Library:** React 19
- **Styling:** Tailwind CSS 3.4

### Infrastructure
- **Monorepo:** Turborepo
- **Package Manager:** npm 11.6.2

## 🏛️ Architecture

```
constitutional-tender-sovereign-web-terminal/
├── apps/
│   ├── api/              # NestJS Backend API
│   │   ├── src/
│   │   │   ├── auth/           # Authentication (Production Ready)
│   │   │   ├── trade-execution/ # Trading logic (In Progress)
│   │   │   ├── market-data/     # Market data (In Progress)
│   │   │   └── prisma.service.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── docs/               # Comprehensive auth documentation
│   └── web/              # Next.js Frontend
│       └── src/
│           ├── app/            # Pages (App Router)
│           └── components/     # React components
└── packages/             # (Planned) Shared code
```

## 🎯 Core Features

### Implemented
- ✅ Auth0 JWT authentication with RS256
- ✅ User management with Auth0 integration
- ✅ Database schema for users, vaults, assets, holdings, transactions
- ✅ Protected/public route patterns
- ✅ Basic UI components

### In Development
- 🏗️ Buy/Sell/Teleport trading operations
- 🏗️ Holdings calculation
- 🏗️ Market data integration
- 🏗️ Frontend-backend integration
- 🏗️ KYC verification flow

### Planned
- 📋 Real-time price feeds
- 📋 Transaction history
- 📋 Portfolio analytics
- 📋 RBAC (Role-Based Access Control)
- 📋 Audit logging
- 📋 Email notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Auth0 account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/financecommander/Constitutional-Tender-Sovereign-Web-Terminal.git
   cd Constitutional-Tender-Sovereign-Web-Terminal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend API
   cp apps/api/.env.example apps/api/.env
   # Edit apps/api/.env with your Auth0 and database credentials
   ```

4. **Setup database**
   ```bash
   cd apps/api
   npx prisma migrate dev
   # TODO: Add seed script
   cd ../..
   ```

5. **Run development servers**
   ```bash
   # Start both API and Web
   npm run dev
   
   # API will run on http://localhost:4000
   # Web will run on http://localhost:3000
   ```

### Build

```bash
# Build all apps
npm run build

# Build specific app
npm run build --filter=@ct-terminal/api
npm run build --filter=@ct-terminal/web
```

## 📚 Documentation

### Authentication
- [AUTH_ARCHITECTURE.md](./apps/api/docs/AUTH_ARCHITECTURE.md) - Comprehensive authentication architecture
- [AUTH0_SETUP.md](./apps/api/docs/AUTH0_SETUP.md) - Step-by-step Auth0 configuration
- [AUTH_QUICK_REFERENCE.md](./apps/api/docs/AUTH_QUICK_REFERENCE.md) - Developer quick reference
- [IMPLEMENTATION_SUMMARY.md](./apps/api/docs/IMPLEMENTATION_SUMMARY.md) - Auth implementation overview

### Project Overview
- [ARCHITECTURAL_REVIEW.md](./ARCHITECTURAL_REVIEW.md) - Comprehensive architectural review and status report

## 🔐 Security

- ✅ Auth0 JWT with RS256 algorithm
- ✅ JWKS-based token verification
- ✅ Audience/issuer validation
- ✅ Environment variable validation
- ✅ CodeQL security scanning (0 vulnerabilities)
- ⚠️ CORS needs production configuration
- ⚠️ Rate limiting needs implementation

## 📊 Project Metrics

- **Total Lines of Code:** ~964
- **Test Coverage:** 0% (testing infrastructure needed)
- **Security Scan:** ✅ Passing (CodeQL)
- **Build Status:** ⚠️ Dependencies not installed

## 🤝 Contributing

This project is in early development. Contribution guidelines will be added as the project matures.

## 📄 License

Private project - All rights reserved

## 🔗 Links

- **Repository:** https://github.com/financecommander/Constitutional-Tender-Sovereign-Web-Terminal
- **Issues:** https://github.com/financecommander/Constitutional-Tender-Sovereign-Web-Terminal/issues

## 📞 Support

For questions or issues, please open a GitHub issue.

---

**Last Updated:** February 14, 2026  
**Version:** 0.1.0  
**Status:** Development
