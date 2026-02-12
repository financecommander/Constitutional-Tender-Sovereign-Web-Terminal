# Backend Authentication Architecture

## Overview
This document describes the authentication architecture for the Constitutional Tender Sovereign Web Terminal, implementing Auth0 JWT with RS256, NestJS 10.4, and Passport.

## Architecture Components

### 1. JWT Strategy (`jwt.strategy.ts`)
- **Purpose**: Validates Auth0 JWT tokens using RS256 algorithm
- **Key Features**:
  - Fetches public keys from Auth0's JWKS endpoint
  - Validates token signature, audience, and issuer
  - Extracts user context from token payload
  - Supports future RBAC through permissions extraction

### 2. JWT Auth Guard (`jwt-auth.guard.ts`)
- **Purpose**: Protects routes requiring authentication
- **Key Features**:
  - Integrates with Passport JWT strategy
  - Respects `@Public()` decorator for unprotected routes
  - Returns 401 Unauthorized for invalid/missing tokens

### 3. Decorators
- **`@Public()`**: Marks routes as publicly accessible
- **`@CurrentUser()`**: Extracts authenticated user from request

## Architectural Questions Answered

### Q1: Should JwtStrategy be global or module-scoped?

**Answer: Module-scoped (current implementation), with option to make global**

#### Current Implementation: Module-Scoped
```typescript
// Routes explicitly use @UseGuards(JwtAuthGuard)
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: UserFromToken) {
  return this.authService.getProfile(user);
}
```

**Benefits of Module-Scoped:**
- ✅ **Explicit control**: Clear which routes are protected
- ✅ **Better debugging**: Authentication issues are easier to trace
- ✅ **Separation of concerns**: Not all modules need authentication
- ✅ **Easier testing**: Can test modules without auth overhead
- ✅ **Gradual adoption**: Add authentication module-by-module

**To Make Global (if needed):**
```typescript
// In app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

Then mark public routes with `@Public()`:
```typescript
@Get('health')
@Public()
healthCheck() {
  return { status: 'ok' };
}
```

**Recommendation**: Start with module-scoped for better control. Move to global if >80% of routes need authentication.

### Q2: Where should I store user permissions - JWT payload or DB lookup?

**Answer: Hybrid approach - JWT payload for performance, DB for flexibility**

#### Recommended Strategy:

**1. Store Basic Permissions in JWT (Auth0)**
```typescript
// JWT payload includes permissions from Auth0
{
  "sub": "auth0|123456",
  "permissions": ["read:trades", "write:trades", "admin:users"]
}
```

**Benefits:**
- ✅ Zero database queries for permission checks
- ✅ Faster authorization decisions
- ✅ Scales horizontally with stateless tokens
- ✅ Works well for standard RBAC roles

**2. Store Complex/Dynamic Permissions in Database**
```typescript
// Database schema for advanced permissions
model UserPermission {
  id         String   @id @default(uuid())
  userId     String
  resource   String   // e.g., "trade:123"
  action     String   // e.g., "read", "write"
  conditions Json?    // Optional conditions
  expiresAt  DateTime?
}
```

**Benefits:**
- ✅ Real-time permission updates (no token refresh needed)
- ✅ Resource-specific permissions (e.g., "can edit trade #123")
- ✅ Complex permission logic (time-based, condition-based)
- ✅ Audit trail of permission changes

#### Implementation Pattern:

```typescript
// 1. Quick check: Use JWT permissions for standard RBAC
if (user.permissions.includes('admin:users')) {
  // Allow action
}

// 2. Complex check: Query DB for resource-specific permissions
const hasAccess = await this.authService.checkPermission(
  user.authId,
  'trade',
  tradeId,
  'write'
);
```

#### When to Use Each:

| Use Case | Storage Location | Reason |
|----------|-----------------|---------|
| Role-based access (Admin, User, Trader) | JWT | Fast, stateless |
| Feature flags (beta features) | JWT | Changes infrequently |
| Resource ownership (my trades) | Database | Dynamic, user-specific |
| Time-limited access | Database | Expires independently |
| Complex business rules | Database | Requires context |

**Recommendation**: 
- Start with JWT permissions for basic RBAC
- Add DB lookup for resource-specific permissions as needed
- Cache DB permissions in Redis for performance

### Q3: Validate this auth flow

#### Recommended Auth Flow:

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Login redirect
       ▼
┌─────────────┐
│   Auth0     │ 2. User authenticates
└──────┬──────┘
       │ 3. Returns JWT (RS256)
       ▼
┌─────────────┐
│   Browser   │ 4. Stores token
└──────┬──────┘
       │ 5. API Request with Authorization: Bearer <token>
       ▼
┌──────────────────────────────────────┐
│           NestJS API                 │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  JwtAuthGuard                  │ │
│  │  - Extracts token from header  │ │
│  └──────────┬─────────────────────┘ │
│             │                        │
│             ▼                        │
│  ┌────────────────────────────────┐ │
│  │  JwtStrategy                   │ │
│  │  - Fetches Auth0 public key    │ │
│  │  - Verifies RS256 signature    │ │
│  │  - Validates audience/issuer   │ │
│  │  - Extracts user payload       │ │
│  └──────────┬─────────────────────┘ │
│             │                        │
│             ▼                        │
│  ┌────────────────────────────────┐ │
│  │  validate() method             │ │
│  │  - Checks required claims      │ │
│  │  - Extracts permissions        │ │
│  │  - Returns UserFromToken       │ │
│  └──────────┬─────────────────────┘ │
│             │                        │
│             ▼                        │
│  ┌────────────────────────────────┐ │
│  │  Request Handler               │ │
│  │  - user attached to request    │ │
│  │  - Access via @CurrentUser()   │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

#### Flow Details:

**Step 1-3: User Authentication (Auth0)**
- User redirected to Auth0 login
- Auth0 handles authentication (username/password, social, MFA)
- Auth0 returns JWT token signed with RS256

**Step 4: Token Storage**
- Frontend stores token (localStorage, sessionStorage, or httpOnly cookie)
- Token includes: sub (user ID), email, permissions, exp (expiration)

**Step 5-8: API Request Authentication**
1. **Guard**: JwtAuthGuard intercepts request
2. **Strategy**: JwtStrategy validates token:
   - Fetches Auth0 public key from JWKS endpoint
   - Verifies signature matches (RS256)
   - Validates audience claim matches API identifier
   - Validates issuer claim matches Auth0 domain
   - Checks token expiration
3. **Validation**: validate() method processes payload:
   - Extracts user ID (sub claim)
   - Extracts permissions
   - Returns user object
4. **Attachment**: User object attached to request.user
5. **Handler**: Controller access user via @CurrentUser()

**Error Handling:**
- Invalid/expired token → 401 Unauthorized
- Missing token (on protected route) → 401 Unauthorized
- Valid token → Request proceeds

#### Token Refresh Strategy:
```typescript
// Frontend: Check token expiration
const tokenExpiry = jwtDecode(token).exp * 1000;
const now = Date.now();

if (tokenExpiry - now < 5 * 60 * 1000) { // 5 minutes before expiry
  // Request new token from Auth0
  const newToken = await auth0.getTokenSilently();
  // Use new token for subsequent requests
}
```

### Q4: What security vulnerabilities should I watch for?

#### Critical Security Considerations:

#### 1. **Algorithm Confusion Attack** ✅ MITIGATED
```typescript
// ❌ VULNERABLE: Accepts any algorithm
algorithms: ['HS256', 'RS256']

// ✅ SECURE: Only RS256
algorithms: ['RS256']
```
**Why**: Attackers could sign tokens with symmetric HS256 using the public key as the secret.

#### 2. **Token Leakage** ⚠️ MONITOR
```typescript
// Frontend: ❌ DON'T store in localStorage (vulnerable to XSS)
localStorage.setItem('token', token);

// ✅ RECOMMENDED: Use Auth0 SDK (handles secure storage automatically)
import { useAuth0 } from '@auth0/auth0-react';
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently();

// Note: With Auth0 architecture, the backend doesn't handle login or issue tokens.
// Auth0 manages authentication and issues tokens directly to the frontend.
// The Auth0 SDK is the recommended approach for token management.
```

#### 3. **Missing Audience/Issuer Validation** ✅ MITIGATED
```typescript
// Our implementation validates both:
audience: process.env.AUTH0_AUDIENCE,  // Prevents token reuse across apps
issuer: process.env.AUTH0_ISSUER_URL,  // Prevents token forgery
```

#### 4. **JWKS Endpoint Attacks** ✅ MITIGATED
```typescript
// Rate limiting prevents DoS attacks
passportJwtSecret({
  cache: true,                      // Cache keys
  rateLimit: true,                  // Enable rate limiting
  jwksRequestsPerMinute: 5,        // Limit requests
  jwksUri: `${process.env.AUTH0_ISSUER_URL}.well-known/jwks.json`,
})
```

#### 5. **Permission Injection** ⚠️ IMPLEMENT
```typescript
// ❌ VULNERABLE: Trust user-provided permissions
@Post('admin/delete-user')
async deleteUser(@Body() body: { userId: string, permissions: string[] }) {
  if (body.permissions.includes('admin')) { // NEVER DO THIS
    // Allow action
  }
}

// ✅ SECURE: Use permissions from validated JWT
@Post('admin/delete-user')
@UseGuards(JwtAuthGuard)
async deleteUser(@CurrentUser() user: UserFromToken) {
  if (user.permissions.includes('admin:delete')) {
    // Allow action
  }
}
```

#### 6. **SQL Injection via User Data** ⚠️ MONITOR
```typescript
// ✅ SECURE: Prisma uses parameterized queries
await this.prisma.user.findUnique({
  where: { authId: user.authId }, // Parameterized
});

// ❌ VULNERABLE: Raw SQL without sanitization
await this.prisma.$queryRaw`SELECT * FROM users WHERE authId = ${user.authId}`;
```

#### 7. **Token Expiration** ⚠️ CONFIGURE
```typescript
// Auth0 configuration:
// - Access token expiration: 15 minutes (short-lived)
// - Refresh token expiration: 30 days (long-lived)
// - Enable refresh token rotation for security
```

#### 8. **Rate Limiting** ⚠️ TODO
```typescript
// Recommended: Add rate limiting middleware
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // Time window in seconds
      limit: 100,   // Max requests per window
    }),
  ],
})
```

#### 9. **CORS Misconfiguration** ⚠️ CONFIGURE
```typescript
// Current: Permissive CORS (main.ts)
app.enableCors();

// ✅ SECURE: Restrict CORS
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});
```

#### 10. **Environment Variables Exposure** ⚠️ SECURE
```bash
# Never commit .env files
# Use secrets management in production
AUTH0_ISSUER_URL=https://your-domain.auth0.com/
AUTH0_AUDIENCE=https://your-api.com
```

## Security Checklist

- [x] RS256 algorithm enforced (no algorithm confusion)
- [x] Audience validation enabled
- [x] Issuer validation enabled
- [x] JWKS rate limiting enabled
- [x] Token signature verification
- [x] Permissions from JWT only (no user input)
- [ ] Configure appropriate token expiration in Auth0
- [ ] Implement rate limiting (ThrottlerModule)
- [ ] Configure strict CORS
- [ ] Use httpOnly cookies for token storage (frontend)
- [ ] Set up secrets management (production)
- [ ] Enable refresh token rotation in Auth0
- [ ] Implement audit logging for sensitive operations
- [ ] Add helmet.js for security headers

## Environment Configuration

Required environment variables:

```bash
# Auth0 Configuration
AUTH0_ISSUER_URL=https://your-domain.auth0.com/
AUTH0_AUDIENCE=https://your-api-identifier.com

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Server
PORT=4000
NODE_ENV=production

# Frontend (for CORS)
FRONTEND_URL=https://your-frontend.com
```

## Testing Authentication

### 1. Get Test Token from Auth0
```bash
# Use Auth0 Management API or Auth0 Dashboard to get a test token
curl --request POST \
  --url https://YOUR_DOMAIN.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":"YOUR_CLIENT_ID","client_secret":"YOUR_CLIENT_SECRET","audience":"YOUR_API_IDENTIFIER","grant_type":"client_credentials"}'
```

### 2. Test Protected Endpoint
```bash
# Should return 401 Unauthorized
curl http://localhost:4000/auth/profile

# Should return user profile
curl http://localhost:4000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Public Endpoint
```bash
# Should work without token
curl http://localhost:4000/auth/health
```

## Future Enhancements

### RBAC Implementation
1. **Define Roles in Auth0**
   - Admin, Trader, Viewer
   - Assign permissions to roles

2. **Create Permission Guard**
```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );
    const { user } = context.switchToHttp().getRequest();
    return requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );
  }
}
```

3. **Use Permission Decorator**
```typescript
@Post('trade')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('write:trades')
executeTrade(@CurrentUser() user: UserFromToken) {
  // Only users with 'write:trades' permission can access
}
```

## References
- [Auth0 Documentation](https://auth0.com/docs)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [OWASP JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
