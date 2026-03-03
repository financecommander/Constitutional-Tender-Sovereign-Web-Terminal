'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import Link from 'next/link';

interface QuoteDetail {
  id: string;
  sku: string;
  productName: string;
  metal: string;
  weightOz: number;
  quantity: number;
  lockedSpotUsd: number;
  lockedPremiumUsd: number;
  lockedSpreadUsd: number;
  lockedShippingUsd: number;
  totalUsd: number;
  deliveryType: string;
  supplierName: string;
  shipEtaDays: number;
  expiresAt: string;
  isExpired: boolean;
  isUsed: boolean;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const quoteId = params.quoteId as string;

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Form state
  const [paymentRail, setPaymentRail] = useState('WIRE');
  const [shipName, setShipName] = useState('');
  const [shipAddress, setShipAddress] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipState, setShipState] = useState('');
  const [shipZip, setShipZip] = useState('');
  const [shipCountry, setShipCountry] = useState('US');

  useEffect(() => {
    api.get(`/api/quotes/${quoteId}`)
      .then((q) => {
        setQuote(q);
        // Countdown
        const expiresAt = new Date(q.expiresAt).getTime();
        const tick = () => {
          const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
          setSecondsLeft(remaining);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [quoteId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;

    setSubmitting(true);
    setError(null);

    try {
      const order = await api.post('/api/orders', {
        quoteId: quote.id,
        paymentRail,
        ...(quote.deliveryType === 'DIRECT_SHIP' ? {
          shipName,
          shipAddress,
          shipCity,
          shipState,
          shipZip,
          shipCountry,
        } : {}),
      });

      router.push(`/app/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-navy-700 rounded animate-pulse" />
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 animate-pulse h-64" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-white">Quote Not Found</h1>
        <p className="text-navy-400">{error || 'This quote does not exist.'}</p>
        <Link href="/app/market" className="text-gold-400 hover:text-gold-300 text-sm">
          Back to Market
        </Link>
      </div>
    );
  }

  const isExpired = quote.isExpired || secondsLeft <= 0;

  if (isExpired && !quote.isUsed) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-white">Quote Expired</h1>
        <p className="text-navy-400">This price lock has expired. Please lock a new price.</p>
        <Link href={`/app/product/${quote.sku}`} className="text-gold-400 hover:text-gold-300 text-sm">
          Back to Product
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Checkout</h1>
          <p className="mt-1 text-navy-400">{quote.productName} &times; {quote.quantity}</p>
        </div>
        {!isExpired && (
          <div className={`text-lg font-bold ${secondsLeft <= 10 ? 'text-red-400' : 'text-green-400'}`}>
            {secondsLeft}s
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Payment Rail */}
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Payment Method</h2>
            <div className="space-y-2">
              {(['WIRE', 'ACH', 'CRYPTO'] as const).map((rail) => (
                <label key={rail} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentRail"
                    value={rail}
                    checked={paymentRail === rail}
                    onChange={(e) => setPaymentRail(e.target.value)}
                    className="accent-gold-500"
                  />
                  <span className="text-white text-sm">{rail === 'WIRE' ? 'Bank Wire' : rail === 'ACH' ? 'ACH Transfer' : 'Cryptocurrency'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Shipping Address (only for DIRECT_SHIP) */}
          {quote.deliveryType === 'DIRECT_SHIP' && (
            <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Shipping Address</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={shipName}
                  onChange={(e) => setShipName(e.target.value)}
                  required
                  className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm placeholder:text-navy-500 focus:border-gold-500/50 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={shipAddress}
                  onChange={(e) => setShipAddress(e.target.value)}
                  required
                  className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm placeholder:text-navy-500 focus:border-gold-500/50 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={shipCity}
                    onChange={(e) => setShipCity(e.target.value)}
                    required
                    className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm placeholder:text-navy-500 focus:border-gold-500/50 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shipState}
                    onChange={(e) => setShipState(e.target.value)}
                    required
                    className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm placeholder:text-navy-500 focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shipZip}
                    onChange={(e) => setShipZip(e.target.value)}
                    required
                    className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm placeholder:text-navy-500 focus:border-gold-500/50 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={shipCountry}
                    onChange={(e) => setShipCountry(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm placeholder:text-navy-500 focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || isExpired}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
              submitting || isExpired
                ? 'bg-navy-700 text-navy-500 cursor-not-allowed'
                : 'bg-gold-500 text-navy-900 hover:bg-gold-400'
            }`}
          >
            {submitting ? 'Placing Order...' : 'Confirm Order'}
          </button>
        </form>

        {/* Right: Price Summary */}
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-5 h-fit sticky top-6">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Order Summary</h2>

          <div className="mb-4">
            <div className="text-white font-semibold">{quote.productName}</div>
            <div className="text-navy-400 text-xs">
              {quote.metal} &middot; {quote.weightOz} oz &middot; {quote.deliveryType === 'DIRECT_SHIP' ? 'Direct Ship' : 'Vault Allocate'}
            </div>
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

          <div className="mt-4 text-xs text-navy-500 space-y-1">
            <div>Supplier: {quote.supplierName}</div>
            <div>Estimated delivery: {quote.shipEtaDays} business days</div>
          </div>
        </div>
      </div>
    </div>
  );
}
