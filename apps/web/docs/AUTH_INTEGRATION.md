# Auth0 React Integration Guide

## Overview

The frontend has been fully integrated with Auth0 for authentication. This guide explains the implementation and how to use it.

## What Was Implemented

### 1. Dependencies
- **@auth0/auth0-react** (v2.3.x) - Official Auth0 SDK for React

### 2. Auth0 Provider (`src/providers/auth0-provider.tsx`)
Client-side provider that wraps the entire application to enable authentication.

**Features:**
- Environment-based configuration
- Refresh token support
- LocalStorage caching
- Automatic error handling for missing config
- Dynamic redirect URI (uses current origin)

**Scopes included:**
- `openid` - Basic authentication
- `profile` - User profile information
- `email` - User email
- `read:trades` - Permission to view trades
- `write:trades` - Permission to execute trades
- `read:holdings` - Permission to view holdings

### 3. API Hook (`src/hooks/use-api.ts`)
Custom React hook for making authenticated API calls to the backend.

**Provides:**
```typescript
const api = useApi();

// GET request
const data = await api.get('/auth/profile');

// POST request
const result = await api.post('/trade/buy', {
  assetId: 'gold-1oz',
  vaultId: 'tx',
  quantity: 10,
  currency: 'USD'
});
```

**Features:**
- Automatic token retrieval
- Authorization header injection
- Error handling
- TypeScript support
- Configurable API base URL

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in `apps/web/`:

```bash
# Auth0 Configuration
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://your-api-identifier.com

# Backend API URL (optional, defaults to http://localhost:4000)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Getting Auth0 Credentials

1. **Domain**: Auth0 Dashboard → Applications → Your App → Settings → Domain
2. **Client ID**: Auth0 Dashboard → Applications → Your App → Settings → Client ID
3. **Audience**: Auth0 Dashboard → APIs → Your API → Settings → Identifier

See backend documentation at `apps/api/docs/AUTH0_SETUP.md` for detailed Auth0 configuration.

## Usage Examples

### Example: Protected Component

```tsx
'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from '@/hooks/use-api';

export function MyComponent() {
  const { isAuthenticated, isLoading } = useAuth0();
  const api = useApi();

  const loadData = async () => {
    const result = await api.get('/auth/profile');
    console.log(result);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <button onClick={loadData}>Load Data</button>;
}
```

## Resources

- [Auth0 React SDK Documentation](https://auth0.com/docs/libraries/auth0-react)
- [Backend Auth Documentation](../../../api/docs/AUTH_ARCHITECTURE.md)
- [Auth0 Setup Guide](../../../api/docs/AUTH0_SETUP.md)
