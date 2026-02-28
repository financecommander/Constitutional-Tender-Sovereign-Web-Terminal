'use client';

import { useApiQuery } from './use-api-query';
import type { Holding } from '@/types/api';

export function useHoldings() {
  return useApiQuery<Holding[]>('/trade/holdings');
}
