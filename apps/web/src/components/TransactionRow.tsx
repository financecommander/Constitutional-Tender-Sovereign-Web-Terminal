'use client';

import type { Transaction } from '@/types/api';

const TYPE_STYLES: Record<string, string> = {
  BUY: 'bg-green-900/30 text-green-400',
  SELL: 'bg-red-900/30 text-red-400',
  TELEPORT: 'bg-blue-900/30 text-blue-400',
  WITHDRAWAL: 'bg-orange-900/30 text-orange-400',
};

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const amount = parseFloat(transaction.totalAmount);
  const qty = parseFloat(transaction.quantity);
  const date = new Date(transaction.createdAt);

  return (
    <div className="flex items-center justify-between py-3 border-b border-navy-700 last:border-b-0">
      <div className="flex items-center space-x-3">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            TYPE_STYLES[transaction.type] || 'bg-navy-700 text-navy-300'
          }`}
        >
          {transaction.type}
        </span>
        <div>
          <p className="text-sm font-medium text-white">
            {transaction.asset.name}
          </p>
          <p className="text-xs text-navy-400">
            {qty.toFixed(4)} units
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          {amount > 0
            ? amount.toLocaleString('en-US', { style: 'currency', currency: transaction.currency })
            : '—'}
        </p>
        <p className="text-xs text-navy-500">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
