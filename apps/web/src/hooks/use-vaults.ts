'use client';

import { useApiQuery } from './use-api-query';
import type { Vault } from '@/types/api';

export function useVaults() {
  return useApiQuery<Vault[]>('/trade/vaults');
}
