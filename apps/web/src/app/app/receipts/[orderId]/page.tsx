'use client';

import { useParams } from 'next/navigation';
import { useOrderDetail } from '@/hooks/use-orders';
import { ReceiptView } from '@/components/ReceiptView';
import Link from 'next/link';

export default function ReceiptPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { data: order, isLoading, error } = useOrderDetail(orderId);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 animate-pulse h-96" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-white">Receipt Not Found</h1>
        <p className="text-navy-400">{error?.message || 'This order does not exist.'}</p>
        <Link href="/app/orders" className="text-gold-400 hover:text-gold-300 text-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions bar (hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/app/orders/${orderId}`} className="text-navy-400 hover:text-white text-sm transition-colors">
          &larr; Back to Order
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors"
        >
          Print Receipt
        </button>
      </div>

      <ReceiptView
        receipt={{
          orderId: order.id,
          productName: order.product.name,
          productSku: order.product.sku,
          metal: order.product.metal,
          weightOz: order.product.weightOz,
          quantity: order.quantity,
          supplier: order.supplier,
          deliveryType: order.deliveryType,
          paymentRail: order.paymentRail,
          spotUsd: order.receipt.spotUsd,
          premiumUsd: order.receipt.premiumUsd,
          spreadUsd: order.receipt.spreadUsd,
          shippingUsd: order.receipt.shippingUsd,
          totalUsd: order.receipt.totalUsd,
          createdAt: order.createdAt,
          shipping: order.shipping,
        }}
      />
    </div>
  );
}
