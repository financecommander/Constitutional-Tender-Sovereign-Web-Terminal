'use client';

import { useCart } from '@/hooks/use-cart';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalEstimate } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-navy-800 border-l border-navy-700 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-navy-700">
          <h2 className="text-lg font-bold text-white">Shopping Cart ({totalItems})</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-navy-400 text-sm">Your cart is empty.</p>
              <Link href="/app/market" className="text-gold-400 hover:text-gold-300 text-sm mt-2 inline-block" onClick={onClose}>
                Browse Products
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.sku} className="bg-navy-900 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">{item.name}</div>
                    <div className="text-navy-400 text-xs mt-0.5">
                      {item.metal} &middot; {item.weightOz} oz
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.sku)}
                    className="text-navy-500 hover:text-red-400 text-sm"
                  >
                    &times;
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-6 h-6 rounded bg-navy-700 text-white text-sm hover:bg-navy-600 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-navy-700 text-white text-sm hover:bg-navy-600"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gold-400 font-semibold text-sm">
                    {item.bestOfferTotalUsd
                      ? `$${(item.bestOfferTotalUsd * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : 'Price on request'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-navy-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-navy-300 text-sm">Estimated Total</span>
              <span className="text-white font-bold text-lg">
                ${totalEstimate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-navy-500 text-xs">
              Save ~4% with Wire/ACH payment
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="flex-1 py-2 bg-navy-700 hover:bg-navy-600 text-navy-300 text-sm rounded-lg transition-colors"
              >
                Clear Cart
              </button>
              <Link
                href="/app/market"
                onClick={onClose}
                className="flex-1 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold text-sm rounded-lg text-center transition-colors"
              >
                Get Quotes
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
