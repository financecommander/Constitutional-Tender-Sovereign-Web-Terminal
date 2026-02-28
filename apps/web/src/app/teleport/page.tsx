'use client';

import { useState, useMemo } from 'react';
import { useHoldings } from '@/hooks/use-holdings';
import { useVaults } from '@/hooks/use-vaults';
import { useApi } from '@/hooks/use-api';

export default function TeleportPage() {
  const { data: holdings, isLoading: holdingsLoading, error: holdingsError, refetch: refetchHoldings } = useHoldings();
  const { data: vaults, isLoading: vaultsLoading } = useVaults();
  const api = useApi();

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [fromVaultId, setFromVaultId] = useState('');
  const [toVaultId, setToVaultId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const uniqueAssets = useMemo(() => {
    if (!holdings) return [];
    const map = new Map(holdings.map((h) => [h.assetId, h.asset]));
    return Array.from(map.values());
  }, [holdings]);

  const availableSourceVaults = useMemo(() => {
    if (!holdings || !selectedAssetId) return [];
    const vaultMap = new Map(
      holdings
        .filter((h) => h.assetId === selectedAssetId && parseFloat(h.quantity) > 0)
        .map((h) => [h.vaultId, h.vault]),
    );
    return Array.from(vaultMap.values());
  }, [holdings, selectedAssetId]);

  const availableDestVaults = useMemo(() => {
    if (!vaults || !fromVaultId) return [];
    return vaults.filter((v) => v.id !== fromVaultId);
  }, [vaults, fromVaultId]);

  const maxQuantity = useMemo(() => {
    if (!holdings || !selectedAssetId || !fromVaultId) return 0;
    const holding = holdings.find(
      (h) => h.assetId === selectedAssetId && h.vaultId === fromVaultId,
    );
    return holding ? parseFloat(holding.quantity) : 0;
  }, [holdings, selectedAssetId, fromVaultId]);

  const selectedAssetName = uniqueAssets.find((a) => a.id === selectedAssetId)?.name ?? '';

  function handleAssetChange(assetId: string) {
    setSelectedAssetId(assetId);
    setFromVaultId('');
    setToVaultId('');
    setQuantity('');
    setResult(null);
  }

  function handleFromVaultChange(vaultId: string) {
    setFromVaultId(vaultId);
    setToVaultId('');
    setQuantity('');
    setResult(null);
  }

  async function handleSubmit() {
    if (!selectedAssetId || !fromVaultId || !toVaultId || !quantity) return;
    const qty = parseFloat(quantity);
    if (qty <= 0 || qty > maxQuantity) return;

    setIsSubmitting(true);
    setResult(null);
    try {
      await api.post('/trade/teleport', {
        assetId: selectedAssetId,
        fromVaultId,
        toVaultId,
        quantity: qty,
      });
      setResult({
        success: true,
        message: `Successfully teleported ${qty} ${selectedAssetName} between vaults.`,
      });
      setQuantity('');
      refetchHoldings();
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Teleport failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFormValid = selectedAssetId && fromVaultId && toVaultId && quantity && parseFloat(quantity) > 0 && parseFloat(quantity) <= maxQuantity;
  const isLoading = holdingsLoading || vaultsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Teleport</h1>
        <p className="mt-1 text-navy-600">Transfer your allocated metals between international vaults.</p>
      </div>

      {holdingsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 flex items-center justify-between">
          <span>Failed to load holdings data.</span>
          <button onClick={refetchHoldings} className="underline font-medium">Retry</button>
        </div>
      )}

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-navy-100 animate-pulse rounded" />
              ))}
            </div>
          ) : uniqueAssets.length === 0 ? (
            <p className="text-navy-400 text-sm">You have no holdings to teleport. Visit the Trade page to buy precious metals first.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Asset</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  className="mt-1 w-full border border-navy-200 rounded-md p-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="">Select an asset...</option>
                  {uniqueAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Source Vault</label>
                <select
                  value={fromVaultId}
                  onChange={(e) => handleFromVaultChange(e.target.value)}
                  disabled={!selectedAssetId}
                  className="mt-1 w-full border border-navy-200 rounded-md p-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select source vault...</option>
                  {availableSourceVaults.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Destination Vault</label>
                <select
                  value={toVaultId}
                  onChange={(e) => { setToVaultId(e.target.value); setResult(null); }}
                  disabled={!fromVaultId}
                  className="mt-1 w-full border border-navy-200 rounded-md p-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select destination vault...</option>
                  {availableDestVaults.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Quantity</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    min="0"
                    max={maxQuantity}
                    step="any"
                    value={quantity}
                    onChange={(e) => { setQuantity(e.target.value); setResult(null); }}
                    disabled={!fromVaultId}
                    placeholder="0.00"
                    className="flex-1 border border-navy-200 rounded-md p-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {maxQuantity > 0 && (
                    <button
                      onClick={() => setQuantity(String(maxQuantity))}
                      className="text-xs text-gold-600 hover:text-gold-700 font-medium whitespace-nowrap"
                    >
                      Max: {maxQuantity.toFixed(4)}
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid}
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Execute Teleport'}
              </button>

              {result && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    result.success
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {result.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
