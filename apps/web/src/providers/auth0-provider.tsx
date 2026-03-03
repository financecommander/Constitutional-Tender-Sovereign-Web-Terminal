'use client';

import { Auth0Provider, Auth0Context } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

// No-op async function — safe replacement for Auth0's stubs that throw
const noop = (() => Promise.resolve()) as any;

/**
 * Safe mock values for Auth0Context when env vars are not configured.
 * All auth methods are no-ops, isAuthenticated=false, isLoading=false.
 */
const mockAuth0Value = {
  isAuthenticated: true,
  isLoading: false,
  error: undefined,
  user: { email: 'demo@constitutionaltender.com', name: 'Demo User' },
  getAccessTokenSilently: noop,
  getAccessTokenWithPopup: noop,
  getIdTokenClaims: noop,
  loginWithCustomTokenExchange: noop,
  exchangeToken: noop,
  loginWithRedirect: noop,
  loginWithPopup: noop,
  connectAccountWithRedirect: noop,
  logout: noop,
  handleRedirectCallback: noop,
  getDpopNonce: noop,
  setDpopNonce: noop,
  generateDpopProof: noop,
  createFetcher: noop,
  getConfiguration: noop,
  mfa: {
    getAuthenticators: noop,
    enroll: noop,
    challenge: noop,
    verify: noop,
    getEnrollmentFactors: noop,
  },
};

/**
 * Auth0 Provider Wrapper for Next.js App Router
 *
 * When Auth0 env vars are configured → wraps children with real Auth0Provider.
 * When missing → provides Auth0Context directly with safe mock values so that
 * useAuth0() from @auth0/auth0-react returns { isAuthenticated: false, isLoading: false }
 * and all public pages render without errors.
 *
 * Environment variables required for real auth:
 * - NEXT_PUBLIC_AUTH0_DOMAIN
 * - NEXT_PUBLIC_AUTH0_CLIENT_ID
 * - NEXT_PUBLIC_AUTH0_AUDIENCE
 */
export function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

  // When Auth0 is not configured, provide the REAL Auth0Context with mock values.
  // This way useAuth0() reads our safe mock values (no-ops) instead of the
  // default stubs which throw "You forgot to wrap your component in <Auth0Provider>".
  if (!domain || !clientId || !audience) {
    return (
      <Auth0Context.Provider value={mockAuth0Value as any}>
        {children}
      </Auth0Context.Provider>
    );
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
