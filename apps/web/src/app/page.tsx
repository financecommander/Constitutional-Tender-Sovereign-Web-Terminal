'use client';

import { useState, useMemo } from 'react';
import { VaultSelector } from '@/components/VaultSelector';
import { TransactionRow } from '@/components/TransactionRow';
import { useHoldings } from '@/hooks/use-holdings';
import { usePrices } from '@/hooks/use-prices';
import { useVaults } from '@/hooks/use-vaults';
import { useTransactions } from '@/hooks/use-transactions';

export default function DashboardPage() {
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);

  const { data: holdings, isLoading: holdingsLoading, error: holdingsError, refetch: refetchHoldings } = useHoldings();
  const { data: prices, isLoading: pricesLoading } = usePrices();
  const { data: vaults, isLoading: vaultsLoading } = useVaults();
  const { data: transactions, isLoading: txLoading } = useTransactions({ limit: 5 });

  const isLoading = holdingsLoading || pricesLoading;

  const { totalValue, goldOz, silverOz } = useMemo(() => {
    if (!holdings || !prices) {
      return { totalValue: 0, goldOz: 0, silverOz: 0 };
    }

    const filtered = selectedVaultId
      ? holdings.filter((h) => h.vaultId === selectedVaultId)
      : holdings;

    const priceMap = new Map(prices.map((p) => [p.id, parseFloat(p.livePriceBid)]));

    const totalValue = filtered.reduce((sum, h) => {
      const price = priceMap.get(h.assetId) || 0;
      return sum + parseFloat(h.quantity) * price;
    }, 0);

    const goldOz = filtered
      .filter((h) => h.asset.metalType === 'GOLD')
      .reduce((sum, h) => sum + parseFloat(h.quantity) * parseFloat(h.asset.weightOz), 0);

    const silverOz = filtered
      .filter((h) => h.asset.metalType === 'SILVER')
      .reduce((sum, h) => sum + parseFloat(h.quantity) * parseFloat(h.asset.weightOz), 0);

    return { totalValue, goldOz, silverOz };
  }, [holdings, prices, selectedVaultId]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-navy-600">
          Manage your allocated precious metals across international vaults.
        </p>
      </div>

      {holdingsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 flex items-center justify-between">
          <span>Failed to load data. Please try again.</span>
          <button
            onClick={refetchHoldings}
            className="underline font-medium"
          >
            Retry
          </button>
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
          <h2 className="text-sm font-semibold text-navy-500 uppercase tracking-wider">
            Total Holdings
          </h2>
          {isLoading ? (
            <div className="mt-2 h-9 w-32 bg-navy-100 animate-pulse rounded" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-navy-900">
              {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
          )}
          <p className="mt-1 text-sm text-navy-400">
            {selectedVaultId ? 'In selected vault' : 'Across all vaults'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-gold-600 uppercase tracking-wider">
            Gold Position
          </h2>
          {isLoading ? (
            <div className="mt-2 h-9 w-32 bg-navy-100 animate-pulse rounded" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-navy-900">
              {goldOz.toFixed(2)}
            </p>
          )}
          <p className="mt-1 text-sm text-navy-400">troy oz allocated</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">
            Silver Position
          </h2>
          {isLoading ? (
            <div className="mt-2 h-9 w-32 bg-navy-100 animate-pulse rounded" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-navy-900">
              {silverOz.toFixed(2)}
            </p>
          )}
          <p className="mt-1 text-sm text-navy-400">troy oz allocated</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
        <h2 className="text-lg font-semibold text-navy-800">
          Recent Transactions
        </h2>
        {txLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-navy-100 animate-pulse rounded" />
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="mt-4">
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-navy-400 text-sm">
            No transactions yet. Use the trading panel to buy, sell, or teleport
            your precious metals.
          </p>
        )}
      </div>
    </div>
  );
}
