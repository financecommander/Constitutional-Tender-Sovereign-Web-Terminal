'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

/**
 * Auth0 Provider Wrapper for Next.js App Router
 * 
 * Wraps the application with Auth0Provider to enable authentication
 * throughout the app. Uses client-side authentication with Auth0 React SDK.
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_AUTH0_DOMAIN: Your Auth0 domain (e.g., your-domain.auth0.com)
 * - NEXT_PUBLIC_AUTH0_CLIENT_ID: Your Auth0 application client ID
 * - NEXT_PUBLIC_AUTH0_AUDIENCE: Your API identifier/audience
 */
export function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

  // Validate required environment variables
  if (!domain || !clientId || !audience) {
    console.error('Auth0 environment variables are missing:', {
      domain: !!domain,
      clientId: !!clientId,
      audience: !!audience,
    });
    return <div className="p-4 bg-red-100 text-red-900">
      Auth0 configuration is missing. Please set NEXT_PUBLIC_AUTH0_DOMAIN, 
      NEXT_PUBLIC_AUTH0_CLIENT_ID, and NEXT_PUBLIC_AUTH0_AUDIENCE environment variables.
    </div>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
        audience: audience,
        scope: 'openid profile email read:trades write:trades read:holdings',
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
