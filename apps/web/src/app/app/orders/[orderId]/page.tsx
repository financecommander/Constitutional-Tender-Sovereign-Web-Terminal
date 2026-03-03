'use client';

import { useParams } from 'next/navigation';
import { useOrderDetail } from '@/hooks/use-orders';
import { OrderTimeline } from '@/components/OrderTimeline';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { data: order, isLoading, error } = useOrderDetail(orderId);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-navy-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 animate-pulse h-64" />
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 animate-pulse h-64" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-white">Order Not Found</h1>
        <p className="text-navy-400">{error?.message || 'This order does not exist.'}</p>
        <Link href="/app/orders" className="text-gold-400 hover:text-gold-300 text-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-navy-400 mb-1">
            <Link href="/app/orders" className="hover:text-white transition-colors">Orders</Link>
            <span>/</span>
            <span className="text-white">#{orderId.slice(0, 8)}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{order.product.name}</h1>
          <p className="text-navy-400 text-sm">
            {order.quantity} &times; {order.product.weightOz} oz {order.product.metal}
          </p>
        </div>
        <Link
          href={`/app/receipts/${orderId}`}
          className="px-4 py-2 rounded-lg bg-navy-800 border border-navy-700 text-white text-sm hover:border-navy-600 transition-colors"
        >
          View Receipt
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Order Timeline</h2>
          <OrderTimeline
            currentStatus={order.status}
            events={order.events}
            deliveryType={order.deliveryType}
          />
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Price Breakdown */}
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Price Breakdown</h2>
            <PriceBreakdown
              spotUsd={order.receipt.spotUsd}
              premiumUsd={order.receipt.premiumUsd}
              spreadUsd={order.receipt.spreadUsd}
              shippingUsd={order.receipt.shippingUsd}
              weightOz={order.product.weightOz}
              quantity={order.quantity}
              totalUsd={order.receipt.totalUsd}
            />
          </div>

          {/* Fulfillment */}
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Fulfillment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-400">Supplier</span>
                <span className="text-white">{order.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Delivery</span>
                <span className="text-white">{order.deliveryType === 'DIRECT_SHIP' ? 'Direct Ship' : 'Vault Allocate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Payment</span>
                <span className="text-white">{order.paymentRail}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          {order.shipping && order.deliveryType === 'DIRECT_SHIP' && (
            <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Ship To</h2>
              <div className="text-sm text-white">
                <div>{order.shipping.name}</div>
                <div>{order.shipping.address}</div>
                <div>{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</div>
                {order.shipping.country && order.shipping.country !== 'US' && (
                  <div>{order.shipping.country}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
