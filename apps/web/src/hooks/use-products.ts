'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ProductListing {
  id: string;
  sku: string;
  metal: string;
  name: string;
  weightOz: number;
  purity: number;
  category: string;
  images: string[];
  eligibleDeliveryTypes: string[];
  flags: string[];
  isActive: boolean;
  bestOfferTotalUsd: number | null;
  bestOfferPremiumUsd: number | null;
  offerCount: number;
}

export function useProducts(metal?: string, category?: string) {
  const [data, setData] = useState<ProductListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (metal) params.set('metal', metal);
    if (category) params.set('category', category);
    const qs = params.toString();

    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/products${qs ? `?${qs}` : ''}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((products) => {
        setData(products);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [metal, category]);

  return { data, isLoading, error };
}

export interface ProductDetail {
  product: {
    id: string;
    sku: string;
    metal: string;
    name: string;
    weightOz: number;
    purity: number;
    category: string;
    images: string[];
    eligibleDeliveryTypes: string[];
    flags: string[];
    isActive: boolean;
  };
  spotPerOz: number;
  offers: OfferDetail[];
}

export interface OfferDetail {
  id: string;
  supplierId: string;
  supplierName: string;
  availableQty: number;
  shipEtaDays: number;
  shipOrigin: string;
  premiumUsd: number;
  constraints: string[];
  totalPerOzUsd: number;
  totalUnitUsd: number;
}

export function useProductDetail(sku: string | null) {
  const [data, setData] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sku) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/products/${sku}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((detail) => {
        setData(detail);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [sku]);

  return { data, isLoading, error };
}
