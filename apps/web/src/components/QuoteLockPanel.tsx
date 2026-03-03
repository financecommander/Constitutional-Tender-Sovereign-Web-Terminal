'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { PriceBreakdown } from './PriceBreakdown';
import { useRouter } from 'next/navigation';

interface QuoteLockPanelProps {
  sku: string;
  offerId: string;
  quantity: number;
  deliveryType: string;
  disabled?: boolean;
}

interface LockedQuote {
  id: string;
  lockedSpotUsd: number;
  lockedPremiumUsd: number;
  lockedSpreadUsd: number;
  lockedShippingUsd: number;
  totalUsd: number;
  weightOz: number;
  quantity: number;
  productName: string;
  supplierName: string;
  shipEtaDays: number;
  expiresAt: string;
}

export function QuoteLockPanel({ sku, offerId, quantity, deliveryType, disabled }: QuoteLockPanelProps) {
  const api = useApi();
  const router = useRouter();
  const [quote, setQuote] = useState<LockedQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearCountdown;
  }, [clearCountdown]);

  const lockPrice = async () => {
    setLoading(true);
    setError(null);
    clearCountdown();

    try {
      const result = await api.post('/api/quotes/lock', {
        sku,
        offerId,
        quantity,
        deliveryType,
      });

      setQuote(result);

      // Start countdown
      const expiresAt = new Date(result.expiresAt).getTime();
      const updateCountdown = () => {
        const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          clearCountdown();
          setQuote(null);
        }
      };

      updateCountdown();
      intervalRef.current = setInterval(updateCountdown, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to lock price');
    } finally {
      setLoading(false);
    }
  };

  const proceedToCheckout = () => {
    if (quote) {
      router.push(`/app/checkout/${quote.id}`);
    }
  };

  if (quote && secondsLeft > 0) {
    return (
      <div className="bg-navy-800 border border-gold-500/30 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">Price Locked</h3>
          <div className={`text-sm font-bold ${secondsLeft <= 10 ? 'text-red-400' : 'text-green-400'}`}>
            {secondsLeft}s
          </div>
        </div>

        {/* Countdown bar */}
        <div className="w-full h-1.5 bg-navy-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              secondsLeft <= 10 ? 'bg-red-400' : 'bg-gold-400'
            }`}
            style={{ width: `${(secondsLeft / 30) * 100}%` }}
          />
        </div>

        <PriceBreakdown
          spotUsd={quote.lockedSpotUsd}
          premiumUsd={quote.lockedPremiumUsd}
          spreadUsd={quote.lockedSpreadUsd}
          shippingUsd={quote.lockedShippingUsd}
          weightOz={quote.weightOz}
          quantity={quote.quantity}
          totalUsd={quote.totalUsd}
        />

        <div className="text-xs text-navy-400 space-y-1">
          <div>Supplier: {quote.supplierName}</div>
          <div>ETA: {quote.shipEtaDays} business days</div>
        </div>

        <button
          onClick={proceedToCheckout}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-gold-500 text-navy-900 hover:bg-gold-400 transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    );
  }

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-lg p-5 space-y-4">
      <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">Lock Price</h3>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded p-2 text-red-400 text-xs">
          {error}
        </div>
      )}

      <button
        onClick={lockPrice}
        disabled={disabled || loading}
        className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
          disabled || loading
            ? 'bg-navy-700 text-navy-500 cursor-not-allowed'
            : 'bg-gold-500 text-navy-900 hover:bg-gold-400'
        }`}
      >
        {loading ? 'Locking...' : disabled ? 'Pricing Unavailable' : 'Lock Price for 30s'}
      </button>

      {disabled && (
        <p className="text-xs text-orange-400 text-center">
          Price feed is stale. Quote locking is disabled.
        </p>
      )}

      <p className="text-xs text-navy-500 text-center">
        Freezes spot + premium for 30 seconds
      </p>
    </div>
  );
}
