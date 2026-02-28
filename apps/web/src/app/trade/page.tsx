'use client';

import { useState, useMemo } from 'react';
import { usePrices } from '@/hooks/use-prices';
import { useVaults } from '@/hooks/use-vaults';
import { useApi } from '@/hooks/use-api';
import type { Currency } from '@/types/api';

const CURRENCIES: Currency[] = ['USD', 'EUR', 'CHF', 'SGD', 'KYD', 'GBP'];

export default function TradePage() {
  const { data: prices, isLoading: pricesLoading } = usePrices();
  const { data: vaults, isLoading: vaultsLoading } = useVaults();
  const api = useApi();

  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedAsset = useMemo(
    () => prices?.find((p) => p.id === selectedAssetId) ?? null,
    [prices, selectedAssetId],
  );

  const unitPrice = useMemo(() => {
    if (!selectedAsset) return 0;
    return mode === 'BUY'
      ? parseFloat(selectedAsset.livePriceAsk)
      : parseFloat(selectedAsset.livePriceBid);
  }, [selectedAsset, mode]);

  const totalCost = unitPrice * parseFloat(quantity || '0');

  async function handleSubmit() {
    if (!selectedAssetId || !selectedVaultId || !quantity) return;
    const qty = parseFloat(quantity);
    if (qty <= 0) return;

    setIsSubmitting(true);
    setResult(null);
    try {
      const endpoint = mode === 'BUY' ? '/trade/buy' : '/trade/sell';
      await api.post(endpoint, {
        assetId: selectedAssetId,
        vaultId: selectedVaultId,
        quantity: qty,
        currency,
      });
      setResult({
        success: true,
        message: `${mode === 'BUY' ? 'Purchase' : 'Sale'} of ${qty} ${selectedAsset?.name ?? 'units'} executed successfully.`,
      });
      setQuantity('');
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Trade failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFormValid = selectedAssetId && selectedVaultId && quantity && parseFloat(quantity) > 0;
  const formLoading = pricesLoading || vaultsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Trade</h1>
        <p className="mt-1 text-navy-600">Buy and sell allocated precious metals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => { setMode('BUY'); setResult(null); }}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === 'BUY'
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => { setMode('SELL'); setResult(null); }}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === 'SELL'
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
              }`}
            >
              Sell
            </button>
          </div>

          {formLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-navy-100 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Asset</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="mt-1 w-full border border-navy-200 rounded-md p-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="">Select an asset...</option>
                  {prices?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-navy-500 uppercase tracking-wider">
                  {mode === 'BUY' ? 'Destination Vault' : 'Source Vault'}
                </label>
                <select
                  value={selectedVaultId}
                  onChange={(e) => setSelectedVaultId(e.target.value)}
                  className="mt-1 w-full border border-navy-200 rounded-md p-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="">Select a vault...</option>
                  {vaults?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full border border-navy-200 rounded-md p-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="mt-1 w-full border border-navy-200 rounded-md p-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid}
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : mode === 'BUY' ? 'Execute Buy' : 'Execute Sell'}
              </button>

              {result && (
                <div
                  className={`mt-4 p-4 rounded-lg text-sm ${
                    result.success
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {result.message}
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Order Summary</h2>
          {selectedAsset ? (
            <>
              <p className="mt-4 text-sm font-medium text-navy-800">{selectedAsset.name}</p>
              <p className="text-xs text-navy-400">{selectedAsset.symbol}</p>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-navy-500">{mode === 'BUY' ? 'Ask' : 'Bid'} Price</span>
                  <span className="font-semibold text-navy-900">
                    {unitPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-navy-500">Spread</span>
                  <span className="text-navy-800">{parseFloat(selectedAsset.spreadPercent).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-navy-500">Quantity</span>
                  <span className="text-navy-800">{quantity || '0'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-navy-100">
                <p className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Estimated Total</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">
                  {totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-navy-400">Select an asset to see pricing.</p>
          )}
        </div>
      </div>
    </div>
  );
}
