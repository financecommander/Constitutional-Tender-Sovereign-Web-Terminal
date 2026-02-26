'use client';

import { useState } from 'react';

export type PaymentMethod = 'card' | 'ach' | 'wire' | 'crypto';

interface PaymentMethodSelectorProps {
  orderAmount: number;
  onSelect: (method: PaymentMethod) => void;
}

function getRecommendedMethod(amount: number): PaymentMethod {
  if (amount >= 50000) return 'wire';
  if (amount >= 5000) return 'ach';
  return 'card';
}

function calculateSavings(amount: number, method: PaymentMethod): string {
  const cardFee = amount * 0.029 + 0.3;
  let methodFee = 0;

  if (method === 'ach') {
    methodFee = Math.min(amount * 0.008, 5);
  } else if (method === 'wire') {
    methodFee = 25;
  } else if (method === 'crypto') {
    methodFee = 0;
  }

  const savings = cardFee - methodFee;
  return savings > 0 ? savings.toFixed(2) : '0.00';
}

export function PaymentMethodSelector({
  orderAmount,
  onSelect,
}: PaymentMethodSelectorProps) {
  const recommended = getRecommendedMethod(orderAmount);
  const [selected, setSelected] = useState<PaymentMethod>(recommended);

  const handleSelect = (method: PaymentMethod) => {
    setSelected(method);
    onSelect(method);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-navy-700 uppercase tracking-wide mb-4">
        Select Payment Method
      </h3>

      {/* Credit/Debit Card */}
      <label
        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
          selected === 'card'
            ? 'border-gold-500 bg-gold-50'
            : 'border-navy-200 hover:border-navy-400'
        }`}
      >
        <input
          type="radio"
          name="payment"
          value="card"
          checked={selected === 'card'}
          onChange={() => handleSelect('card')}
          className="sr-only"
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-navy-900">
              Credit / Debit Card
            </span>
            {recommended === 'card' && (
              <span className="text-xs bg-gold-500 text-navy-900 px-2 py-0.5 rounded font-medium">
                Recommended
              </span>
            )}
          </div>
          <span className="text-sm text-navy-600">2.9% + $0.30</span>
        </div>
        <p className="text-xs text-navy-500 mt-1">
          Instant settlement · Orders $100 – $5,000
        </p>
      </label>

      {/* ACH Bank Transfer — visible when order >= $5k */}
      {orderAmount >= 5000 && (
        <label
          className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
            selected === 'ach'
              ? 'border-gold-500 bg-gold-50'
              : 'border-navy-200 hover:border-navy-400'
          } ${recommended === 'ach' ? 'ring-2 ring-gold-400' : ''}`}
        >
          <input
            type="radio"
            name="payment"
            value="ach"
            checked={selected === 'ach'}
            onChange={() => handleSelect('ach')}
            className="sr-only"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-navy-900">
                Bank Transfer (ACH)
              </span>
              {recommended === 'ach' && (
                <span className="text-xs bg-gold-500 text-navy-900 px-2 py-0.5 rounded font-medium">
                  Recommended
                </span>
              )}
            </div>
            <span className="text-sm text-navy-600">0.8% (max $5)</span>
          </div>
          <p className="text-xs text-navy-500 mt-1">
            3–5 business days · Orders $5,000 – $50,000
          </p>
          <p className="text-xs text-green-600 mt-1 font-medium">
            Save ${calculateSavings(orderAmount, 'ach')} vs card
          </p>
        </label>
      )}

      {/* Wire Transfer — visible when order > $50k */}
      {orderAmount >= 50000 && (
        <label
          className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
            selected === 'wire'
              ? 'border-gold-500 bg-gold-50'
              : 'border-navy-200 hover:border-navy-400'
          } ${recommended === 'wire' ? 'ring-2 ring-gold-400' : ''}`}
        >
          <input
            type="radio"
            name="payment"
            value="wire"
            checked={selected === 'wire'}
            onChange={() => handleSelect('wire')}
            className="sr-only"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-navy-900">Wire Transfer</span>
              {recommended === 'wire' && (
                <span className="text-xs bg-gold-500 text-navy-900 px-2 py-0.5 rounded font-medium">
                  Recommended
                </span>
              )}
            </div>
            <span className="text-sm text-navy-600">$25 flat fee</span>
          </div>
          <p className="text-xs text-navy-500 mt-1">
            Same / next business day · Orders $50,000+
          </p>
          <p className="text-xs text-green-600 mt-1 font-medium">
            Save ${calculateSavings(orderAmount, 'wire')} vs card
          </p>
        </label>
      )}

      {/* Cryptocurrency — visible when order >= $10k */}
      {orderAmount >= 10000 && (
        <label
          className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
            selected === 'crypto'
              ? 'border-gold-500 bg-gold-50'
              : 'border-navy-200 hover:border-navy-400'
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="crypto"
            checked={selected === 'crypto'}
            onChange={() => handleSelect('crypto')}
            className="sr-only"
          />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-navy-900">
              Cryptocurrency (USDC / USDT)
            </span>
            <span className="text-sm text-green-600 font-medium">No fee</span>
          </div>
          <p className="text-xs text-navy-500 mt-1">
            On-chain confirmation · Next business day settlement
          </p>
          <p className="text-xs text-green-600 mt-1 font-medium">
            Save ${calculateSavings(orderAmount, 'crypto')} vs card · International friendly
          </p>
        </label>
      )}
    </div>
  );
}
