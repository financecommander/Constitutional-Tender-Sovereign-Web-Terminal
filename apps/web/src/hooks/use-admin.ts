'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Generic fetch helper for admin endpoints (no auth required in demo mode)
async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Admin API error: ${res.status}`);
  }

  return res.json();
}

// ==================
// Dashboard Stats
// ==================

export interface AdminStats {
  overview: {
    totalUsers: number;
    totalOrders: number;
    activeProducts: number;
    activeSuppliers: number;
    totalRevenue: number;
  };
  ordersByStatus: Record<string, number>;
  recentOrders: {
    id: string;
    status: string;
    user: string;
    product: string;
    total: number;
    createdAt: string;
  }[];
  spotStatus: {
    lastUpdate: string;
    isStale: boolean;
  };
}

export function useAdminStats() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await adminFetch<AdminStats>('/api/admin/stats');
      setData(stats);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch stats'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, isLoading, error, refetch };
}

// ==================
// Orders Management
// ==================

export interface AdminOrder {
  id: string;
  status: string;
  user: { email: string; name: string };
  product: { sku: string; name: string; metal: string };
  supplier: string;
  quantity: number;
  deliveryType: string;
  paymentRail: string;
  receipt: {
    spot: number;
    premium: number;
    spread: number;
    shipping: number;
    total: number;
  };
  shipping: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
  events: { stage: string; note: string; createdAt: string }[];
  createdAt: string;
}

export function useAdminOrders(status?: string) {
  const [data, setData] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = status ? `?status=${status}` : '';
      const orders = await adminFetch<AdminOrder[]>(`/api/admin/orders${query}`);
      setData(orders);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch orders'));
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, isLoading, error, refetch };
}

export async function advanceOrderStatus(orderId: string, status: string, note?: string) {
  return adminFetch(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}

// ==================
// Users Management
// ==================

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  kycStatus: string;
  baseCurrency: string;
  orderCount: number;
  quoteCount: number;
  createdAt: string;
}

export function useAdminUsers() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const users = await adminFetch<AdminUser[]>('/api/admin/users');
      setData(users);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch users'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, isLoading, error, refetch };
}

export async function setUserKycStatus(userId: string, status: string) {
  return adminFetch(`/api/admin/users/${userId}/kyc`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ==================
// System Health
// ==================

export interface SystemHealth {
  status: string;
  checks: {
    database: { status: string };
    spotFeed: { status: string; lastUpdate: string };
    email: { provider: string };
    kyc: { provider: string };
    payments: { stripe: boolean };
  };
  timestamp: string;
}

export function useSystemHealth() {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const health = await adminFetch<SystemHealth>('/api/admin/health');
      setData(health);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch health'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, isLoading, error, refetch };
}

// ==================
// Spot Override
// ==================

export async function overrideSpotPrice(metal: string, spotUsdPerOz: number, changePct24h: number) {
  return adminFetch('/api/admin/spot/override', {
    method: 'POST',
    body: JSON.stringify({ metal, spotUsdPerOz, changePct24h }),
  });
}
