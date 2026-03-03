'use client';

import { useOrders } from '@/hooks/use-orders';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  PRICE_LOCKED: 'bg-blue-900/30 text-blue-400',
  FUNDS_CONFIRMED: 'bg-yellow-900/30 text-yellow-400',
  SUPPLIER_CONFIRMED: 'bg-purple-900/30 text-purple-400',
  SHIPMENT_CREATED: 'bg-indigo-900/30 text-indigo-400',
  IN_TRANSIT: 'bg-orange-900/30 text-orange-400',
  DELIVERED: 'bg-green-900/30 text-green-400',
  VAULT_ALLOCATED: 'bg-green-900/30 text-green-400',
  CANCELLED: 'bg-red-900/30 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  PRICE_LOCKED: 'Price Locked',
  FUNDS_CONFIRMED: 'Funds Confirmed',
  SUPPLIER_CONFIRMED: 'Supplier Confirmed',
  SHIPMENT_CREATED: 'Shipment Created',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  VAULT_ALLOCATED: 'Vault Allocated',
  CANCELLED: 'Cancelled',
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Orders</h1>
        <p className="mt-1 text-navy-400">Track your orders and view receipts.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-navy-800 border border-navy-700 rounded-lg p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          Failed to load orders: {error.message}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 text-center">
          <p className="text-navy-400 text-sm">No orders yet.</p>
          <Link href="/app/market" className="text-gold-400 hover:text-gold-300 text-sm mt-2 inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/app/orders/${order.id}`}
              className="block bg-navy-800 border border-navy-700 rounded-lg p-4 hover:border-navy-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-white font-medium text-sm">{order.product.name}</div>
                    <div className="text-navy-400 text-xs">
                      {order.product.metal} &middot; {order.quantity} &times; {order.product.weightOz} oz &middot; {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-sm">
                    ${order.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_STYLES[order.status] || 'bg-navy-700 text-navy-400'}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
