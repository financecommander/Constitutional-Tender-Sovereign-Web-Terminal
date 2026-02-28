# Constitutional Tender Sovereign

## A Decentralized Precious Metals Custody and Trading Terminal

**Version 0.1.0 — February 2026**

---

## Abstract

Constitutional Tender Sovereign (CTS) is a web-based platform for the direct ownership, trading, and cross-border transfer of allocated precious metals held in geographically distributed vault facilities. The system enables individuals to buy, sell, and teleport physical gold, silver, platinum, and palladium across a network of five sovereign vault jurisdictions — the United States (Texas, Wyoming), Singapore, Switzerland, and the Cayman Islands — while maintaining a complete, auditable chain of custody for every troy ounce.

CTS addresses a structural gap in the precious metals market: the absence of a modern, low-latency digital interface for managing allocated physical holdings across multiple custodial jurisdictions. Existing solutions either centralize custody in a single location, operate on unallocated pool accounts that expose holders to counterparty risk, or rely on legacy paper-based transfer systems that take days to settle.

The platform implements institutional-grade authentication, atomic trade execution with balance integrity guarantees, real-time bid/ask pricing, multi-currency settlement, and a Know Your Customer (KYC) verification pipeline — all delivered through a responsive web terminal designed for both retail and institutional participants.

---

## 1. Problem Statement

### 1.1 Counterparty Risk in Unallocated Accounts

The majority of retail precious metals platforms operate on an unallocated model, where customer balances represent claims against a pooled inventory rather than title to specific bars or coins. In a custodian default scenario, unallocated holders rank as unsecured creditors. The 2011 MF Global collapse demonstrated this risk when customer segregated funds were used to cover proprietary trading losses. CTS eliminates this category of risk entirely — every holding on the platform represents allocated, physically vaulted metal.

### 1.2 Jurisdictional Concentration

Holding all physical metal in a single country exposes the owner to sovereign risk: seizure, export controls, taxation changes, or political instability. Historical precedents include Executive Order 6102 (1933 US gold confiscation), the 2013 Cyprus bail-in of bank deposits, and ongoing capital controls in various jurisdictions. Geographic diversification of custody is a fundamental risk management strategy that most retail platforms do not offer.

### 1.3 Settlement Friction

Transferring allocated metal between vault facilities traditionally involves paperwork, multi-day settlement windows, and counterparty coordination. CTS introduces the concept of "teleportation" — an atomic, software-mediated transfer of allocated metal between vaults that settles in a single database transaction, reducing transfer friction from days to seconds at the record-keeping layer.

### 1.4 Lack of Transparency

Many platforms provide limited visibility into real-time pricing spreads, transaction histories, and vault-level allocation details. CTS exposes live bid/ask spreads per asset, maintains a complete transaction ledger per user, and tracks holdings at the vault-asset level with full decimal precision.

---

## 2. System Architecture

CTS is built as a monorepo containing two applications — a NestJS API server and a Next.js web client — sharing a PostgreSQL database through Prisma ORM.

### 2.1 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| API Framework | NestJS | 10.4 |
| Web Framework | Next.js (App Router) | 15.1 |
| Language | TypeScript (strict mode) | 5.7 |
| Database | PostgreSQL + Prisma ORM | 6.3 |
| Authentication | Auth0 (RS256 JWT + JWKS) | — |
| UI Runtime | React | 19.0 |
| Styling | Tailwind CSS | 3.4 |
| Monorepo | Turborepo | 2.4 |

### 2.2 Component Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │             Next.js 15 Web Terminal (port 3000)           │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │  │
│  │  │Dashboard │ │  Trade   │ │ Teleport │ │  Portfolio  │  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │  │
│  │       └─────────────┴────────────┴─────────────┘          │  │
│  │                    Auth0 React SDK                        │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTPS + Bearer JWT
┌──────────────────────────────┼──────────────────────────────────┐
│                         API Server                              │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │              NestJS 10 API (port 4000)                    │  │
│  │  ┌────────────┐  ┌────────────────┐  ┌────────────────┐  │  │
│  │  │ Auth Module │  │ Trade Module   │  │ Market Module  │  │  │
│  │  │ JWT + JWKS  │  │ Buy/Sell/Tele  │  │ Prices + FX   │  │  │
│  │  └────────────┘  └────────────────┘  └────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │  Global: ValidationPipe │ PrismaFilter │ JwtGuard  │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │ Prisma Client
┌──────────────────────────────┼──────────────────────────────────┐
│                        PostgreSQL                               │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Users  │ │ Vaults │ │ Assets │ │ Holdings │ │Transactions│  │
│  └────────┘ └────────┘ └────────┘ └──────────┘ └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Data Model

The database schema centers on five entities that model the full lifecycle of precious metals custody:

**User** — Represents an authenticated participant. Each user has a unique Auth0 identity, a KYC verification status (PENDING, VERIFIED, REJECTED), and a preferred base currency. Users cannot execute trades until KYC is verified.

**Vault** — A physical storage facility in a specific regulatory jurisdiction. Each vault declares which asset classes it supports, its geographic location, and its active/inactive status. The initial network comprises five facilities:

| Vault | Location | Jurisdiction |
|---|---|---|
| Texas Depository | Austin, TX | United States |
| Wyoming Vault | Cheyenne, WY | United States |
| Singapore Freeport | Singapore | Singapore |
| Zurich Vault | Zurich | Switzerland |
| Cayman Vault | Grand Cayman | Cayman Islands |

**Asset** — A tradeable precious metal product defined by metal type (gold, silver, platinum, palladium), weight in troy ounces, and live bid/ask pricing with spread percentage. Assets are identified by ISO-style symbols (e.g., XAU-1OZ, XAG-100OZ).

**Holding** — The core allocation record. A holding represents a specific quantity of a specific asset in a specific vault belonging to a specific user. The compound unique constraint (userId, assetId, vaultId) ensures each allocation is tracked independently. This is the source of truth for ownership.

**Transaction** — An immutable record of every operation: BUY, SELL, TELEPORT, or WITHDRAWAL. Transactions capture the price per unit, total amount, currency, source/destination vaults, FX rate, and status. This ledger provides a complete audit trail.

### 2.4 Entity Relationships

```
User ──┬── 1:N ──── Holding ────── N:1 ── Asset
       │                │
       │                └───────── N:1 ── Vault
       │
       └── 1:N ──── Transaction ── N:1 ── Asset
                        ├───────── N:1 ── Vault (from)
                        └───────── N:1 ── Vault (to)
```

---

## 3. Vault Network

### 3.1 Jurisdiction Selection Criteria

The five vault jurisdictions were selected based on a composite evaluation of:

- **Legal Framework** — Strength of property rights, rule of law index, and precedent for precious metals custody.
- **Political Stability** — Low risk of expropriation, capital controls, or arbitrary regulatory action.
- **Tax Treatment** — Favorable treatment of physical precious metals (no sales tax on bullion in Texas and Wyoming; no capital gains tax in the Cayman Islands; VAT exemptions in Swiss freeports and Singapore freeports).
- **Geographic Distribution** — Coverage across North America, Europe, and Asia-Pacific to mitigate regional concentration risk.
- **Infrastructure** — Existing vault facilities, insurance availability, and logistics networks.

### 3.2 Teleportation

The teleport operation enables a user to move allocated metal from one vault to another. At the database layer, this is executed as a single atomic transaction:

1. Validate that the user holds sufficient quantity in the source vault.
2. Create a TELEPORT transaction record with source and destination vault references.
3. Decrement the holding quantity in the source vault.
4. Upsert (create or increment) the holding quantity in the destination vault.

All four operations execute within a single Prisma `$transaction` block. If any step fails, the entire operation rolls back — there is no state where metal has left one vault but not arrived at the other. This atomicity guarantee is fundamental to the integrity of the system.

The physical movement of metal is a separate operational concern that occurs asynchronously. The database teleport represents a change in allocated ownership records. The physical logistics of inter-vault transfers — armored transport, insurance, customs documentation — are managed out-of-band by vault operators.

### 3.3 Supported Assets

| Symbol | Name | Metal | Weight |
|---|---|---|---|
| XAU-1OZ | Gold 1 oz | Gold | 1 troy oz |
| XAU-10OZ | Gold 10 oz Bar | Gold | 10 troy oz |
| XAG-1OZ | Silver 1 oz | Silver | 1 troy oz |
| XAG-100OZ | Silver 100 oz Bar | Silver | 100 troy oz |
| XPT-1OZ | Platinum 1 oz | Platinum | 1 troy oz |
| XPD-1OZ | Palladium 1 oz | Palladium | 1 troy oz |

---

## 4. Trade Execution

### 4.1 Order Types

CTS implements market-order execution. When a user submits a buy or sell, the trade executes immediately at the current live price.

**Buy** — The user specifies an asset, quantity, destination vault, and settlement currency. The system:

1. Validates the asset exists and is active.
2. Reads the current `livePriceAsk` (the price at which the platform sells to the user).
3. Computes `totalAmount = livePriceAsk × quantity`.
4. Creates a COMPLETED transaction record.
5. Upserts the user's holding in the specified vault.

**Sell** — The user specifies an asset, quantity, source vault, and settlement currency. The system:

1. Validates the asset exists and is active.
2. Validates the user holds sufficient quantity in the specified vault.
3. Reads the current `livePriceBid` (the price at which the platform buys from the user).
4. Computes `totalAmount = livePriceBid × quantity`.
5. Creates a COMPLETED transaction record.
6. Decrements the user's holding in the specified vault.

### 4.2 Atomicity

Every trade operation executes within a database transaction. The read (price lookup, balance check) and the write (transaction creation, holding mutation) occur in the same transactional scope. This prevents race conditions where concurrent operations could overdraw a holding or execute at a stale price.

### 4.3 Pricing Model

Each asset maintains two prices:

- **Bid** — The price the platform pays to acquire metal from the user (sell price).
- **Ask** — The price the platform charges to deliver metal to the user (buy price).
- **Spread** — The percentage difference between bid and ask, representing the platform's margin.

Prices are stored as arbitrary-precision decimals to avoid floating-point rounding errors on financial calculations.

### 4.4 Multi-Currency Settlement

Trades can settle in six currencies: USD, EUR, CHF, SGD, KYD, and GBP. The transaction record includes an optional `fxRate` field to capture the exchange rate applied when the settlement currency differs from the asset's base pricing currency.

---

## 5. Authentication and Security

### 5.1 Identity Architecture

CTS delegates identity management to Auth0, an enterprise identity platform. This provides:

- **Delegated credential storage** — CTS never stores passwords. Authentication credentials are managed entirely by Auth0's infrastructure.
- **Multi-factor authentication** — Auth0 supports configurable MFA policies (TOTP, SMS, push notification) without any CTS-side implementation.
- **Social and enterprise login** — Users can authenticate via Google, Apple, or SAML-based enterprise identity providers.
- **Brute-force protection** — Auth0 provides automated account lockout and anomaly detection.

### 5.2 Token Verification

The API verifies JWT tokens using RS256 (RSA Signature with SHA-256), an asymmetric algorithm where:

- Auth0 signs tokens with a private key that never leaves their infrastructure.
- The CTS API verifies tokens using Auth0's public key, fetched via the JWKS (JSON Web Key Set) endpoint.

This eliminates an entire class of vulnerabilities:

- **No shared secret** — Unlike HS256, there is no symmetric key that could be leaked or brute-forced.
- **No algorithm confusion** — The API is configured to accept only RS256, preventing attacks that substitute a weaker algorithm.
- **Key rotation** — Auth0 can rotate signing keys without any CTS deployment changes; the API fetches the current public key dynamically.

JWKS requests are rate-limited to 5 per minute to prevent abuse of the key-fetching mechanism.

### 5.3 Authorization Model

The API implements a global guard architecture:

- All endpoints are protected by default via `APP_GUARD` with `JwtAuthGuard`.
- Public endpoints (health checks, market data) are explicitly opted out using a `@Public()` decorator.
- The `@CurrentUser()` decorator extracts the authenticated user's identity from the JWT payload, providing type-safe access to `authId`, `email`, `permissions`, and `metadata`.

### 5.4 Input Validation

All incoming request bodies are validated through NestJS's `ValidationPipe` configured with:

- **whitelist: true** — Strips any properties not defined in the DTO, preventing mass-assignment attacks.
- **forbidNonWhitelisted: true** — Rejects requests that include unknown properties.
- **transform: true** — Automatically coerces types (e.g., string to number).

Trade DTOs enforce UUID format for entity references, positive numeric values for quantities, and enumerated values for currencies.

### 5.5 Error Isolation

A global `PrismaExceptionFilter` intercepts database errors and maps them to safe HTTP responses:

| Prisma Code | HTTP Status | Response |
|---|---|---|
| P2002 (Unique violation) | 409 Conflict | Generic constraint message |
| P2025 (Record not found) | 404 Not Found | Generic not-found message |
| P2003 (Foreign key violation) | 400 Bad Request | Generic reference message |
| P2014 (Relation violation) | 400 Bad Request | Generic relation message |
| Default | 500 Internal Server Error | Generic database message |

This prevents database schema details, table names, and column names from leaking to clients in error responses.

---

## 6. Compliance Framework

### 6.1 Know Your Customer (KYC)

Every user account begins in a PENDING KYC state. The schema supports a three-state verification lifecycle:

- **PENDING** — Account created, identity not yet verified.
- **VERIFIED** — Identity documents reviewed and approved.
- **REJECTED** — Verification failed or documents insufficient.

The KYC verification endpoint (`POST /auth/verify-kyc`) provides the integration point for identity verification services. Trading operations can be gated on KYC status at the service layer.

### 6.2 Transaction Audit Trail

Every operation that modifies holdings produces an immutable transaction record containing:

- User identity
- Asset and quantity (precise decimal)
- Operation type (BUY, SELL, TELEPORT, WITHDRAWAL)
- Status (PENDING, COMPLETED, FAILED, CANCELLED)
- Price per unit and total amount
- Settlement currency and FX rate
- Source and/or destination vault
- Timestamp

This ledger satisfies the record-keeping requirements for financial services regulators and provides the data foundation for SAR (Suspicious Activity Report) generation, tax reporting, and audit responses.

### 6.3 Multi-Jurisdiction Design

By maintaining per-vault regulatory jurisdiction metadata, the system can enforce jurisdiction-specific rules:

- Asset restrictions (certain metals may not be storable in certain jurisdictions)
- Reporting thresholds (US CTR requirements, Singapore MAS thresholds)
- Tax withholding calculations
- Sanctions screening at the vault level

---

## 7. Web Terminal

### 7.1 Interface Design

The web terminal follows a dashboard-centric layout with a persistent sidebar for navigation and a header bar displaying authentication state and active currency context.

**Dashboard** — Displays portfolio summary cards (total holdings value, gold position, silver position), vault allocation breakdown, and recent transaction history.

**Trade** — Buy and sell interface with asset selection, quantity input, vault selection, currency selection, and live price display.

**Teleport** — Vault-to-vault transfer interface with source vault, destination vault, asset, and quantity selection.

**Portfolio** — Detailed holdings view broken down by vault and asset, with current market valuations.

**Transactions** — Full transaction history with filtering by type, status, asset, vault, and date range.

### 7.2 Client-Side Security

- **Auth0 React SDK** manages the token lifecycle: acquisition, refresh, and injection into API requests.
- **ProtectedRoute** component wraps authenticated pages, redirecting unauthenticated users to login.
- **ErrorBoundary** provides graceful failure handling at the React component tree level.
- **useApi hook** centralizes authenticated API calls with automatic token attachment and memoized configuration.

---

## 8. Roadmap

### Phase 1 — Foundation (Current)

- Authentication infrastructure (Auth0 + JWT RS256)
- Database schema and ORM integration
- Trade execution logic (buy, sell, teleport)
- Market data service (asset pricing)
- Web terminal UI shell (dashboard, navigation)
- Input validation and error handling
- Database seeding (vaults and assets)

### Phase 2 — Integration

- Real-time market data API integration (live precious metals pricing feeds)
- Frontend-to-backend wiring (connect UI components to API endpoints)
- KYC verification workflow (document upload, review, status tracking)
- Transaction history UI with filtering and export
- Portfolio valuation engine (multi-currency, multi-vault aggregation)

### Phase 3 — Hardening

- Comprehensive test suite (unit, integration, end-to-end)
- Rate limiting and DDoS protection
- Structured logging and monitoring (error tracking, performance metrics)
- CI/CD pipeline (automated testing, staging, production deployment)
- Security audit (penetration testing, dependency scanning)

### Phase 4 — Expansion

- Additional vault jurisdictions (Dubai, Hong Kong, London)
- Limit orders and scheduled purchases
- Withdrawal to physical delivery
- API access for institutional clients
- Mobile application
- Advanced reporting (tax statements, portfolio analytics, PDF exports)
- Role-based access control (family offices, advisors, sub-accounts)

---

## 9. Risk Factors

**Regulatory Risk** — Precious metals custody and trading is subject to financial services regulation in each vault jurisdiction. Changes in law could affect the ability to operate vaults, execute trades, or transfer metal across borders.

**Custodial Risk** — While CTS provides the digital record-keeping and trading layer, physical custody of metal depends on vault operators. Vault operator default, theft, or fraud would affect the physical backing of digital allocations.

**Technology Risk** — The platform depends on the availability of Auth0 for authentication, PostgreSQL for data persistence, and network connectivity between components. Extended outages in any dependency would affect platform availability.

**Market Risk** — Precious metals prices are volatile. The platform does not provide investment advice and makes no guarantees about the future value of holdings.

**Liquidity Risk** — The bid/ask spread represents the cost of immediate execution. In periods of extreme market stress, spreads may widen significantly.

---

## 10. Conclusion

Constitutional Tender Sovereign provides a technically sound foundation for allocated precious metals custody and trading across sovereign jurisdictions. The architecture prioritizes correctness (atomic transactions, precise decimal arithmetic), security (asymmetric JWT, input validation, error isolation), and auditability (complete transaction ledger, KYC pipeline) — the properties most critical to a financial custody platform.

The multi-vault network addresses jurisdictional concentration risk. The teleport mechanism reduces transfer friction. The open pricing model (visible bid/ask spreads) promotes transparency. And the modern web terminal makes institutional-grade precious metals management accessible through a browser.

The system is designed to scale from individual retail participants to institutional allocators, with the data model and API architecture supporting future additions of limit orders, role-based access, and third-party API integrations without schema-breaking changes.

---

*Constitutional Tender Sovereign — Allocated. Auditable. Sovereign.*
