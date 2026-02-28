'use client';

import type { Transaction } from '@/types/api';

const TYPE_STYLES: Record<string, string> = {
  BUY: 'bg-green-100 text-green-800',
  SELL: 'bg-red-100 text-red-800',
  TELEPORT: 'bg-blue-100 text-blue-800',
  WITHDRAWAL: 'bg-orange-100 text-orange-800',
};

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const amount = parseFloat(transaction.totalAmount);
  const qty = parseFloat(transaction.quantity);
  const date = new Date(transaction.createdAt);

  return (
    <div className="flex items-center justify-between py-3 border-b border-navy-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            TYPE_STYLES[transaction.type] || 'bg-navy-100 text-navy-800'
          }`}
        >
          {transaction.type}
        </span>
        <div>
          <p className="text-sm font-medium text-navy-800">
            {transaction.asset.name}
          </p>
          <p className="text-xs text-navy-400">
            {qty.toFixed(4)} units
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-navy-800">
          {amount > 0
            ? amount.toLocaleString('en-US', { style: 'currency', currency: transaction.currency })
            : '—'}
        </p>
        <p className="text-xs text-navy-400">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
