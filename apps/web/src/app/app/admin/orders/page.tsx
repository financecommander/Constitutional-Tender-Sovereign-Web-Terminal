'use client';

import { useState } from 'react';
import { useAdminOrders, advanceOrderStatus, AdminOrder } from '@/hooks/use-admin';

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

const STATUS_FLOW = [
  'PRICE_LOCKED',
  'FUNDS_CONFIRMED',
  'SUPPLIER_CONFIRMED',
  'SHIPMENT_CREATED',
  'IN_TRANSIT',
  'DELIVERED',
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: orders, isLoading, error, refetch } = useAdminOrders(statusFilter);
  const [expanding, setExpanding] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const handleAdvance = async (order: AdminOrder) => {
    const currentIdx = STATUS_FLOW.indexOf(order.status);
    if (currentIdx < 0 || currentIdx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[currentIdx + 1];

    setAdvancing(true);
    try {
      await advanceOrderStatus(order.id, nextStatus, `Advanced to ${nextStatus} by admin`);
      refetch();
    } catch (e) {
      alert(`Failed to advance: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Order Management</h1>
          <p className="mt-1 text-navy-400">View and manage all orders.</p>
        </div>
        <button onClick={refetch} className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white text-sm rounded-lg transition-colors">
          Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!statusFilter ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-navy-300 hover:bg-navy-700'}`}
        >
          All
        </button>
        {STATUS_FLOW.concat(['VAULT_ALLOCATED', 'CANCELLED']).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-navy-300 hover:bg-navy-700'}`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-navy-800 border border-navy-700 rounded-lg p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          {error.message}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 text-center">
          <p className="text-navy-400 text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-navy-800 border border-navy-700 rounded-lg overflow-hidden">
              {/* Order Row */}
              <div
                className="p-4 cursor-pointer hover:bg-navy-700/30 transition-colors"
                onClick={() => setExpanding(expanding === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-white font-medium text-sm">{order.product.name}</div>
                      <div className="text-navy-400 text-xs">
                        {order.user.email} &middot; {order.quantity}x &middot; {order.deliveryType} &middot; {order.paymentRail}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold text-sm">
                      ${order.receipt.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_STYLES[order.status] || ''}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <svg
                      className={`w-4 h-4 text-navy-400 transition-transform ${expanding === order.id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expanding === order.id && (
                <div className="border-t border-navy-700 p-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-navy-400 block">Order ID</span>
                      <span className="text-white font-mono text-xs">{order.id.slice(0, 12)}...</span>
                    </div>
                    <div>
                      <span className="text-navy-400 block">Supplier</span>
                      <span className="text-white">{order.supplier}</span>
                    </div>
                    <div>
                      <span className="text-navy-400 block">Created</span>
                      <span className="text-white">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-navy-400 block">Product SKU</span>
                      <span className="text-white">{order.product.sku}</span>
                    </div>
                  </div>

                  {/* Receipt */}
                  <div className="bg-navy-900 rounded-lg p-3">
                    <h4 className="text-navy-400 text-xs font-semibold uppercase mb-2">Receipt Breakdown</h4>
                    <div className="grid grid-cols-5 gap-2 text-sm">
                      <div><span className="text-navy-400 block">Spot</span><span className="text-white">${order.receipt.spot.toFixed(2)}</span></div>
                      <div><span className="text-navy-400 block">Premium</span><span className="text-white">${order.receipt.premium.toFixed(2)}</span></div>
                      <div><span className="text-navy-400 block">Spread</span><span className="text-white">${order.receipt.spread.toFixed(2)}</span></div>
                      <div><span className="text-navy-400 block">Shipping</span><span className="text-white">${order.receipt.shipping.toFixed(2)}</span></div>
                      <div><span className="text-navy-400 block">Total</span><span className="text-gold-400 font-semibold">${order.receipt.total.toFixed(2)}</span></div>
                    </div>
                  </div>

                  {/* Timeline */}
                  {order.events.length > 0 && (
                    <div>
                      <h4 className="text-navy-400 text-xs font-semibold uppercase mb-2">Timeline</h4>
                      <div className="space-y-1">
                        {order.events.map((e, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-white">{e.stage.replace(/_/g, ' ')}</span>
                            {e.note && <span className="text-navy-400">— {e.note}</span>}
                            <span className="text-navy-500 text-xs ml-auto">{new Date(e.createdAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advance Button */}
                  {STATUS_FLOW.indexOf(order.status) >= 0 && STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1 && (
                    <button
                      onClick={() => handleAdvance(order)}
                      disabled={advancing}
                      className="bg-gold-500 hover:bg-gold-600 disabled:opacity-40 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      {advancing ? 'Advancing...' : `Advance to ${STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1].replace(/_/g, ' ')}`}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
