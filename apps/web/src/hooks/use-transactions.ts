'use client';

import { useApiQuery } from './use-api-query';
import type { Transaction } from '@/types/api';

export function useTransactions(options?: { limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));
  const query = params.toString();
  const endpoint = `/trade/transactions${query ? `?${query}` : ''}`;
  return useApiQuery<Transaction[]>(endpoint);
}
