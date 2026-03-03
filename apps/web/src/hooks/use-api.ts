'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useMemo } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Custom hook for making authenticated API calls
 * 
 * Automatically handles:
 * - Getting access token from Auth0
 * - Adding Authorization header
 * - Calling the backend API
 * 
 * @example
 * ```tsx
 * const api = useApi();
 * const profile = await api.get('/auth/profile');
 * const holdings = await api.get('/trade/holdings');
 * const result = await api.post('/trade/buy', { assetId, vaultId, quantity, currency });
 * ```
 */
export function useApi() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const makeRequest = useCallback(
    async (
      endpoint: string,
      options: RequestInit = {}
    ): Promise<any> => {
      if (!isAuthenticated) {
        throw new Error('User is not authenticated');
      }

      try {
        // Get access token from Auth0
        const token = await getAccessTokenSilently();

        // Prepare request with Authorization header
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        };

        const url = `${API_BASE_URL}${endpoint}`;

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: response.statusText,
          }));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    [getAccessTokenSilently, isAuthenticated]
  );

  return useMemo(
    () => ({
      get: (endpoint: string) => makeRequest(endpoint, { method: 'GET' }),

      post: (endpoint: string, data: Record<string, unknown>) =>
        makeRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(data),
        }),

      put: (endpoint: string, data: Record<string, unknown>) =>
        makeRequest(endpoint, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),

      delete: (endpoint: string) =>
        makeRequest(endpoint, { method: 'DELETE' }),

      request: makeRequest,
    }),
    [makeRequest],
  );
}
