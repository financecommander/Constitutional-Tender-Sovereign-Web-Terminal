'use client';

import { useApi } from './use-api';
import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useApiQuery<T>(endpoint: string | null): UseApiQueryResult<T> {
  const api = useApi();
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const shouldFetch = endpoint !== null && isAuthenticated && !authLoading;

  const fetchData = useCallback(async () => {
    if (!shouldFetch || !endpoint) {
      if (!authLoading) setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get(endpoint);
      if (mountedRef.current) {
        setData(result as T);
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    }
  }, [api, endpoint, shouldFetch, authLoading]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
