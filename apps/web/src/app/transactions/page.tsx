'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { TransactionRow } from '@/components/TransactionRow';
import { useApiQuery } from '@/hooks/use-api-query';
import { useApi } from '@/hooks/use-api';
import type { Transaction, TransactionType } from '@/types/api';

const PAGE_SIZE = 20;
const FILTER_TYPES: Array<TransactionType | 'ALL'> = ['ALL', 'BUY', 'SELL', 'TELEPORT'];

export default function TransactionsPage() {
  const { data: initialData, isLoading, error, refetch } = useApiQuery<Transaction[]>(
    `/trade/transactions?limit=${PAGE_SIZE}&offset=0`,
  );
  const api = useApi();

  const [extraTransactions, setExtraTransactions] = useState<Transaction[]>([]);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const loadedInitial = useRef(false);

  useEffect(() => {
    if (initialData && !loadedInitial.current) {
      loadedInitial.current = true;
      setHasMore(initialData.length === PAGE_SIZE);
    }
  }, [initialData]);

  const allTransactions = useMemo(
    () => [...(initialData || []), ...extraTransactions],
    [initialData, extraTransactions],
  );

  const filteredTransactions = useMemo(() => {
    if (typeFilter === 'ALL') return allTransactions;
    return allTransactions.filter((tx) => tx.type === typeFilter);
  }, [allTransactions, typeFilter]);

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      const result: Transaction[] = await api.get(
        `/trade/transactions?limit=${PAGE_SIZE}&offset=${offset}`,
      );
      setExtraTransactions((prev) => [...prev, ...result]);
      setOffset((prev) => prev + result.length);
      setHasMore(result.length === PAGE_SIZE);
    } catch {
      // silently fail, user can retry
    } finally {
      setIsLoadingMore(false);
    }
  }, [api, offset]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Transactions</h1>
        <p className="mt-1 text-navy-600">Complete history of your trades and transfers.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 flex items-center justify-between">
          <span>Failed to load transactions.</span>
          <button onClick={refetch} className="underline font-medium">Retry</button>
        </div>
      )}

      <div className="flex space-x-2">
        {FILTER_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              typeFilter === type
                ? 'bg-gold-500 text-navy-900'
                : 'bg-white border border-navy-200 text-navy-600 hover:bg-navy-50'
            }`}
          >
            {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-navy-100 animate-pulse rounded" />
            ))}
          </div>
        ) : filteredTransactions.length > 0 ? (
          <>
            {filteredTransactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </>
        ) : (
          <p className="text-navy-400 text-sm">
            {typeFilter === 'ALL'
              ? 'No transactions yet.'
              : `No ${typeFilter.toLowerCase()} transactions found.`}
          </p>
        )}

        {hasMore && !isLoading && allTransactions.length > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
