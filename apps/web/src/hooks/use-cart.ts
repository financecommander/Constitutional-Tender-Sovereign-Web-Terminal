'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  sku: string;
  name: string;
  metal: string;
  weightOz: number;
  quantity: number;
  bestOfferTotalUsd: number | null;
  addedAt: number;
}

const CART_KEY = 'ct-cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'addedAt'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === item.sku);
      let next: CartItem[];
      if (existing) {
        next = prev.map((i) =>
          i.sku === item.sku ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        next = [...prev, { ...item, addedAt: Date.now() }];
      }
      saveCart(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.sku !== sku);
      saveCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((sku: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => {
      const next = prev.map((i) => (i.sku === sku ? { ...i, quantity } : i));
      saveCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    saveCart([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalEstimate = items.reduce(
    (sum, i) => sum + (i.bestOfferTotalUsd || 0) * i.quantity,
    0
  );

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalEstimate,
  };
}
