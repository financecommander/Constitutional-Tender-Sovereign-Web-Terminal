'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  return {
    /**
     * Make a GET request to the API
     */
    get: (endpoint: string) => makeRequest(endpoint, { method: 'GET' }),

    /**
     * Make a POST request to the API
     */
    post: (endpoint: string, data: any) =>
      makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /**
     * Make a PUT request to the API
     */
    put: (endpoint: string, data: any) =>
      makeRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    /**
     * Make a DELETE request to the API
     */
    delete: (endpoint: string) => makeRequest(endpoint, { method: 'DELETE' }),

    /**
     * Make a custom request to the API
     */
    request: makeRequest,
  };
}
