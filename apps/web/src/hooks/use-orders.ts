'use client';

import { useApiQuery } from './use-api-query';

export interface OrderSummary {
  id: string;
  status: string;
  deliveryType: string;
  product: {
    sku: string;
    name: string;
    metal: string;
    weightOz: number;
  };
  quantity: number;
  totalUsd: number;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  status: string;
  deliveryType: string;
  paymentRail: string;
  product: {
    sku: string;
    name: string;
    metal: string;
    weightOz: number;
  };
  quantity: number;
  supplier: string;
  shipping: {
    name: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
  } | null;
  receipt: {
    spotUsd: number;
    premiumUsd: number;
    spreadUsd: number;
    shippingUsd: number;
    totalUsd: number;
  };
  events: {
    id: string;
    stage: string;
    note: string | null;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export function useOrders() {
  return useApiQuery<OrderSummary[]>('/api/orders');
}

export function useOrderDetail(orderId: string | null) {
  return useApiQuery<OrderDetail>(orderId ? `/api/orders/${orderId}` : null);
}
