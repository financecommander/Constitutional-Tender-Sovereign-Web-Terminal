# Authentication Quick Reference

Quick reference for developers working with the authentication system.

## Protecting Routes

### Protect a Single Route
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, UserFromToken } from '../auth/decorators/current-user.decorator';

@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: UserFromToken) {
  return { authId: user.authId, email: user.email };
}
```

### Protect All Routes in a Controller
```typescript
@Controller('trade')
@UseGuards(JwtAuthGuard) // Apply to all routes
export class TradeController {
  @Post('buy')
  buy(@CurrentUser() user: UserFromToken) {
    // Protected route
  }

  @Post('sell')
  sell(@CurrentUser() user: UserFromToken) {
    // Protected route
  }
}
```

### Make Route Public
```typescript
import { Public } from '../auth/decorators/public.decorator';

@Get('health')
@Public() // Skip authentication
healthCheck() {
  return { status: 'ok' };
}
```

## Accessing User Context

### Get Full User Object
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: UserFromToken) {
  // user.authId - Auth0 user ID
  // user.email - User email
  // user.permissions - Array of permissions
  // user.metadata - Additional metadata
}
```

### Get Specific User Property
```typescript
@Get('my-id')
@UseGuards(JwtAuthGuard)
getMyId(@CurrentUser('authId') authId: string) {
  return { authId };
}
```

## UserFromToken Interface
```typescript
interface UserFromToken {
  authId: string;           // Auth0 user ID (sub claim)
  email?: string;           // User email
  permissions: string[];    // RBAC permissions
  metadata?: Record<string, any>; // Custom metadata
}
```

## Module Setup

To use authentication in your module:

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Import AuthModule
  controllers: [YourController],
  providers: [YourService],
})
export class YourModule {}
```

## Testing

### Unit Tests
```typescript
describe('YourController', () => {
  let controller: YourController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [YourController],
      providers: [
        YourService,
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) }, // Mock
        },
      ],
    }).compile();

    controller = module.get<YourController>(YourController);
  });

  it('should get profile', () => {
    const mockUser: UserFromToken = {
      authId: 'auth0|123',
      email: 'test@example.com',
      permissions: ['read:trades'],
      metadata: {},
    };

    const result = controller.getProfile(mockUser);
    expect(result).toBeDefined();
  });
});
```

### E2E Tests
```typescript
import * as request from 'supertest';

describe('Auth (e2e)', () => {
  let app;

  beforeAll(async () => {
    // Setup test app
  });

  it('/auth/health (GET) - public', () => {
    return request(app.getHttpServer())
      .get('/auth/health')
      .expect(200);
  });

  it('/auth/profile (GET) - protected', () => {
    return request(app.getHttpServer())
      .get('/auth/profile')
      .expect(401); // Should fail without token
  });

  it('/auth/profile (GET) - with token', () => {
    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });
});
```

**Note**: These are example test patterns. Actual E2E test implementation should be added to the project's test suite based on your testing infrastructure.

## Common Patterns

### Check Permissions
```typescript
@Post('admin/action')
@UseGuards(JwtAuthGuard)
async adminAction(@CurrentUser() user: UserFromToken) {
  if (!user.permissions.includes('admin:action')) {
    throw new ForbiddenException('Insufficient permissions');
  }
  // Perform admin action
}
```

### Get or Create User
```typescript
async getProfile(@CurrentUser() user: UserFromToken) {
  // Find user in DB
  let dbUser = await this.prisma.user.findUnique({
    where: { authId: user.authId },
  });

  // Create if doesn't exist (first login)
  if (!dbUser) {
    dbUser = await this.prisma.user.create({
      data: {
        authId: user.authId,
        email: user.email,
        fullName: user.email.split('@')[0],
      },
    });
  }

  return dbUser;
}
```

### Verify Resource Ownership
```typescript
@Delete('trade/:id')
@UseGuards(JwtAuthGuard)
async deleteTrade(
  @CurrentUser() user: UserFromToken,
  @Param('id') tradeId: string,
) {
  const trade = await this.prisma.transaction.findUnique({
    where: { id: tradeId },
  });

  if (!trade) {
    throw new NotFoundException('Trade not found');
  }

  // Verify user owns this trade
  if (trade.userId !== user.authId) {
    throw new ForbiddenException('You can only delete your own trades');
  }

  return this.prisma.transaction.delete({
    where: { id: tradeId },
  });
}
```

## Making It Global (Optional)

To apply authentication globally:

### 1. Update AppModule
```typescript
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

### 2. Mark Public Routes
```typescript
@Get('health')
@Public() // Required for unauthenticated access
healthCheck() {
  return { status: 'ok' };
}
```

## Environment Variables

Required `.env` configuration:

```bash
# Auth0 Configuration
AUTH0_ISSUER_URL=https://your-domain.auth0.com/
AUTH0_AUDIENCE=https://your-api-identifier.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db

# Server
PORT=4000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Causes:**
- Missing Authorization header
- Invalid/expired token
- Token signature verification failed

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```
**Causes:**
- User lacks required permissions
- User doesn't own the resource

## Security Checklist

When implementing authenticated routes:

- [ ] Use `@UseGuards(JwtAuthGuard)` on protected routes
- [ ] Get user ID from `@CurrentUser()`, never from request body
- [ ] Verify resource ownership before modifications
- [ ] Check permissions for sensitive operations
- [ ] Use `@Public()` for truly public routes
- [ ] Validate all user inputs
- [ ] Log security-relevant events
- [ ] Never trust client-provided user IDs

## Troubleshooting

### Guard not working
✅ Ensure AuthModule is imported in your module
```typescript
@Module({
  imports: [AuthModule],
})
```

### User object is undefined
✅ Make sure route has `@UseGuards(JwtAuthGuard)`
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard) // Required!
getProfile(@CurrentUser() user: UserFromToken)
```

### Can't access public route
✅ Add `@Public()` decorator
```typescript
@Get('health')
@Public() // Skip authentication
healthCheck()
```

## Next Steps

1. Read [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) for architecture details
2. Read [AUTH0_SETUP.md](./AUTH0_SETUP.md) for Auth0 configuration
3. Implement permission-based guards for RBAC
4. Add audit logging for sensitive operations
5. Configure rate limiting

## Resources

- [NestJS Guards](https://docs.nestjs.com/guards)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport Documentation](http://www.passportjs.org/)
