'use client';

import { useApiQuery } from './use-api-query';
import type { User } from '@/types/api';

export function useProfile() {
  return useApiQuery<User>('/auth/profile');
}
