'use client';

import { useApiQuery } from './use-api-query';
import type { AssetPrice } from '@/types/api';

export function usePrices() {
  return useApiQuery<AssetPrice[]>('/market-data/prices');
}
