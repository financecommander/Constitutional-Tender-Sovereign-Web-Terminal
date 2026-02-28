'use client';

import { useState, useMemo } from 'react';
import { VaultSelector } from '@/components/VaultSelector';
import { useHoldings } from '@/hooks/use-holdings';
import { usePrices } from '@/hooks/use-prices';
import { useVaults } from '@/hooks/use-vaults';
import type { Holding } from '@/types/api';

export default function PortfolioPage() {
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);

  const { data: holdings, isLoading: holdingsLoading, error: holdingsError, refetch } = useHoldings();
  const { data: prices, isLoading: pricesLoading } = usePrices();
  const { data: vaults, isLoading: vaultsLoading } = useVaults();

  const isLoading = holdingsLoading || pricesLoading;

  const { filteredHoldings, totalValue, goldValue, goldOz, silverValue, silverOz, groupedByMetal } = useMemo(() => {
    if (!holdings || !prices) {
      return { filteredHoldings: [], totalValue: 0, goldValue: 0, goldOz: 0, silverValue: 0, silverOz: 0, groupedByMetal: {} as Record<string, Holding[]> };
    }

    const filtered = selectedVaultId
      ? holdings.filter((h) => h.vaultId === selectedVaultId)
      : holdings;

    const priceMap = new Map(prices.map((p) => [p.id, parseFloat(p.livePriceBid)]));

    const getValue = (h: Holding) => parseFloat(h.quantity) * (priceMap.get(h.assetId) || 0);
    const getOz = (h: Holding) => parseFloat(h.quantity) * parseFloat(h.asset.weightOz);

    const totalValue = filtered.reduce((sum, h) => sum + getValue(h), 0);

    const goldHoldings = filtered.filter((h) => h.asset.metalType === 'GOLD');
    const silverHoldings = filtered.filter((h) => h.asset.metalType === 'SILVER');

    const grouped: Record<string, Holding[]> = {};
    for (const h of filtered) {
      const type = h.asset.metalType;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(h);
    }

    return {
      filteredHoldings: filtered,
      totalValue,
      goldValue: goldHoldings.reduce((sum, h) => sum + getValue(h), 0),
      goldOz: goldHoldings.reduce((sum, h) => sum + getOz(h), 0),
      silverValue: silverHoldings.reduce((sum, h) => sum + getValue(h), 0),
      silverOz: silverHoldings.reduce((sum, h) => sum + getOz(h), 0),
      groupedByMetal: grouped,
    };
  }, [holdings, prices, selectedVaultId]);

  const formatCurrency = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Portfolio</h1>
        <p className="mt-1 text-navy-600">Your allocated precious metals across all vaults.</p>
      </div>

      {holdingsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 flex items-center justify-between">
          <span>Failed to load portfolio data.</span>
          <button onClick={refetch} className="underline font-medium">Retry</button>
        </div>
      )}

      <VaultSelector
        vaults={vaults ?? []}
        selectedVaultId={selectedVaultId}
        onSelect={setSelectedVaultId}
        isLoading={vaultsLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Total Portfolio Value</h2>
          {isLoading ? (
            <div className="mt-2 h-9 w-32 bg-navy-100 animate-pulse rounded" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-navy-900">{formatCurrency(totalValue)}</p>
          )}
          <p className="mt-1 text-sm text-navy-400">{selectedVaultId ? 'In selected vault' : 'Across all vaults'}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-gold-600 uppercase tracking-wider">Gold Holdings</h2>
          {isLoading ? (
            <div className="mt-2 h-9 w-32 bg-navy-100 animate-pulse rounded" />
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold text-navy-900">{formatCurrency(goldValue)}</p>
              <p className="mt-1 text-sm text-navy-400">{goldOz.toFixed(2)} troy oz</p>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">Silver Holdings</h2>
          {isLoading ? (
            <div className="mt-2 h-9 w-32 bg-navy-100 animate-pulse rounded" />
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold text-navy-900">{formatCurrency(silverValue)}</p>
              <p className="mt-1 text-sm text-navy-400">{silverOz.toFixed(2)} troy oz</p>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-navy-100 animate-pulse rounded" />
          ))}
        </div>
      ) : filteredHoldings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <p className="text-navy-400 text-sm">No holdings yet. Visit the Trade page to buy precious metals.</p>
        </div>
      ) : (
        Object.entries(groupedByMetal).map(([metalType, metalHoldings]) => (
          <div key={metalType} className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
            <h2 className="text-lg font-semibold text-navy-800 mb-4">{metalType.charAt(0) + metalType.slice(1).toLowerCase()} Holdings</h2>
            {metalHoldings.map((h) => {
              const qty = parseFloat(h.quantity);
              const weightTotal = qty * parseFloat(h.asset.weightOz);
              const priceMap = prices ? new Map(prices.map((p) => [p.id, parseFloat(p.livePriceBid)])) : new Map();
              const value = qty * (priceMap.get(h.assetId) || 0);
              return (
                <div key={h.id} className="flex items-center justify-between py-3 border-b border-navy-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-navy-800">{h.asset.name}</p>
                    <p className="text-xs text-navy-400">{h.vault.name} — {h.vault.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-navy-800">{weightTotal.toFixed(4)} troy oz</p>
                    <p className="text-xs text-navy-400">{formatCurrency(value)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
