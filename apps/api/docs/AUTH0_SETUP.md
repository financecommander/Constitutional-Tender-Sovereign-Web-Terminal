# Auth0 Setup Guide

This guide will walk you through setting up Auth0 for your Constitutional Tender Sovereign Web Terminal API.

## Prerequisites
- An Auth0 account (sign up at https://auth0.com)
- Access to the Auth0 Dashboard

## Step 1: Create an Auth0 Application

1. Log in to your [Auth0 Dashboard](https://manage.auth0.com)
2. Navigate to **Applications** → **Applications** in the sidebar
3. Click **Create Application**
4. Choose a name (e.g., "Constitutional Tender API")
5. Select **Single Page Application** (for React/Vue/Angular frontend)
6. Click **Create**

## Step 2: Configure Application Settings

In your application settings:

1. **Allowed Callback URLs**: Add your frontend URLs
   ```
   http://localhost:3000/callback
   https://your-production-domain.com/callback
   ```

2. **Allowed Logout URLs**: Add your frontend URLs
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```

3. **Allowed Web Origins**: Add your frontend URLs
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```

4. Click **Save Changes**

## Step 3: Create an API in Auth0

1. Navigate to **Applications** → **APIs** in the sidebar
2. Click **Create API**
3. Fill in the details:
   - **Name**: Constitutional Tender API
   - **Identifier**: `https://constitutional-tender-api.com` (this becomes your AUTH0_AUDIENCE)
   - **Signing Algorithm**: RS256 ✅ (Must be RS256!)
4. Click **Create**

## Step 4: Configure API Permissions

1. In your API settings, go to the **Permissions** tab
2. Add permissions for RBAC:
   ```
   read:trades         - View trade data
   write:trades        - Execute trades
   read:holdings       - View holdings
   admin:users         - Manage users
   admin:kyc           - Verify KYC
   ```

## Step 5: Get Your Environment Variables

### Get AUTH0_ISSUER_URL:
1. In the Auth0 Dashboard, go to **Applications** → **Applications**
2. Click on your application
3. Find the **Domain** field (e.g., `dev-abc123.us.auth0.com`)
4. Your issuer URL is: `https://[YOUR_DOMAIN]/`
   ```
   AUTH0_ISSUER_URL=https://dev-abc123.us.auth0.com/
   ```

### Get AUTH0_AUDIENCE:
1. Navigate to **Applications** → **APIs**
2. Click on your API
3. Copy the **Identifier** field
   ```
   AUTH0_AUDIENCE=https://constitutional-tender-api.com
   ```

## Step 6: Configure Your Application

1. Copy the example environment file:
   ```bash
   cd apps/api
   cp .env.example .env
   ```

2. Update `.env` with your Auth0 credentials:
   ```bash
   AUTH0_ISSUER_URL=https://your-domain.auth0.com/
   AUTH0_AUDIENCE=https://your-api-identifier.com
   DATABASE_URL=postgresql://user:password@localhost:5432/constitutional_tender
   PORT=4000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

## Step 7: Test the Configuration

### Option 1: Get a Test Token via Auth0 Dashboard

1. Go to **Applications** → **APIs** → Your API
2. Click the **Test** tab
3. Click **Copy Token** to get a test token
4. Test your API:
   ```bash
   # Test protected endpoint (should fail without token)
   curl http://localhost:4000/auth/profile
   # Expected: 401 Unauthorized

   # Test protected endpoint (should succeed with token)
   curl http://localhost:4000/auth/profile \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   # Expected: User profile data

   # Test public endpoint (should work without token)
   curl http://localhost:4000/auth/health
   # Expected: {"status":"ok","timestamp":"..."}
   ```

### Option 2: Get Token via Machine-to-Machine Auth

```bash
curl --request POST \
  --url https://YOUR_DOMAIN.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"YOUR_CLIENT_ID",
    "client_secret":"YOUR_CLIENT_SECRET",
    "audience":"YOUR_API_IDENTIFIER",
    "grant_type":"client_credentials"
  }'
```

## Step 8: Frontend Integration

### Install Auth0 SPA SDK

```bash
npm install @auth0/auth0-react
# or
npm install @auth0/auth0-spa-js
```

### Configure Auth0Provider (React Example)

```typescript
import { Auth0Provider } from '@auth0/auth0-react';

function App() {
  return (
    <Auth0Provider
      domain="your-domain.auth0.com"
      clientId="your-client-id"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://your-api-identifier.com",
        scope: "openid profile email read:trades write:trades"
      }}
    >
      {/* Your app components */}
    </Auth0Provider>
  );
}
```

### Make Authenticated API Calls

```typescript
import { useAuth0 } from '@auth0/auth0-react';

function MyComponent() {
  const { getAccessTokenSilently } = useAuth0();

  const makeApiCall = async () => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch('http://localhost:4000/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  return <button onClick={makeApiCall}>Get Profile</button>;
}
```

## Step 9: Enable RBAC (Optional but Recommended)

1. Go to **Applications** → **APIs** → Your API
2. Click the **Settings** tab
3. Enable **RBAC Settings**:
   - ✅ Enable RBAC
   - ✅ Add Permissions in the Access Token
4. Click **Save**

### Create Roles

1. Navigate to **User Management** → **Roles**
2. Click **Create Role**
3. Create roles:
   - **Admin**: All permissions
   - **Trader**: `read:trades`, `write:trades`, `read:holdings`
   - **Viewer**: `read:trades`, `read:holdings`

### Assign Roles to Users

1. Navigate to **User Management** → **Users**
2. Click on a user
3. Go to the **Roles** tab
4. Click **Assign Roles**
5. Select the appropriate role

## Security Best Practices

### 1. Token Storage
- ✅ Use Auth0 SDK (handles secure token storage)
- ✅ Or use httpOnly cookies
- ❌ Avoid localStorage (vulnerable to XSS)

### 2. Token Expiration
Recommended settings in Auth0:
- Access Token: 15 minutes
- Refresh Token: 30 days
- Enable Refresh Token Rotation

### 3. MFA (Multi-Factor Authentication)
1. Go to **Security** → **Multi-factor Auth**
2. Enable at least one MFA method (SMS, Push, or Authenticator)
3. Recommended: Make MFA mandatory for admin users

### 4. Anomaly Detection
1. Go to **Security** → **Attack Protection**
2. Enable:
   - ✅ Brute Force Protection
   - ✅ Suspicious IP Throttling
   - ✅ Breached Password Detection

## Troubleshooting

### Error: "audience is required"
- Make sure `AUTH0_AUDIENCE` is set in your `.env` file
- Verify the audience matches your API identifier in Auth0

### Error: "issuer mismatch"
- Ensure `AUTH0_ISSUER_URL` ends with a trailing slash `/`
- Verify the domain matches your Auth0 tenant

### Error: "jwt malformed"
- Check that you're including the full token (not truncated)
- Verify the token format: `Bearer eyJhbGc...`

### Error: "No verifying keys found"
- Check that your Auth0 API is using RS256 algorithm
- Verify the JWKS URL is accessible: `https://your-domain.auth0.com/.well-known/jwks.json`

### 401 Unauthorized on all routes
- Make sure AuthModule is imported in modules using JwtAuthGuard
- Verify token is being sent in Authorization header
- Check that token hasn't expired

## Next Steps

1. ✅ Auth0 is configured
2. ✅ API authentication is working
3. ✅ Frontend is integrated
4. 📝 Configure rate limiting (see AUTH_ARCHITECTURE.md)
5. 📝 Set up monitoring and logging
6. 📝 Implement audit trails for sensitive operations
7. 📝 Configure production secrets management

## Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Auth0 React Quickstart](https://auth0.com/docs/quickstart/spa/react)
- [API Architecture Documentation](./AUTH_ARCHITECTURE.md)
- [OWASP JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
