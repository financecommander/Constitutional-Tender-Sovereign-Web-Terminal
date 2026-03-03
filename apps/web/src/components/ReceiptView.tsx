'use client';

interface ReceiptData {
  orderId: string;
  productName: string;
  productSku: string;
  metal: string;
  weightOz: number;
  quantity: number;
  supplier: string;
  deliveryType: string;
  paymentRail: string;
  spotUsd: number;
  premiumUsd: number;
  spreadUsd: number;
  shippingUsd: number;
  totalUsd: number;
  createdAt: string;
  shipping?: {
    name: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
  } | null;
}

interface ReceiptViewProps {
  receipt: ReceiptData;
}

export function ReceiptView({ receipt }: ReceiptViewProps) {
  const unitPrice = (receipt.spotUsd + receipt.premiumUsd + receipt.spreadUsd) * receipt.weightOz;

  return (
    <div className="bg-white text-gray-900 rounded-lg p-8 max-w-2xl mx-auto print:shadow-none print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Constitutional Tender</h1>
          <p className="text-sm text-gray-500 mt-1">Order Receipt</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Order #{receipt.orderId.slice(0, 8)}</div>
          <div>{new Date(receipt.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Product */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Product</h2>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Item</span>
            <span className="text-gray-900 font-medium">{receipt.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SKU</span>
            <span className="text-gray-900 font-mono text-xs">{receipt.productSku}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Metal</span>
            <span className="text-gray-900">{receipt.metal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Weight</span>
            <span className="text-gray-900">{receipt.weightOz} oz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Quantity</span>
            <span className="text-gray-900">{receipt.quantity}</span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Price Breakdown</h2>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Locked Spot Price</span>
            <span className="text-gray-900">${receipt.spotUsd.toFixed(2)}/oz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Supplier Premium</span>
            <span className="text-gray-900">+${receipt.premiumUsd.toFixed(2)}/oz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform Spread</span>
            <span className="text-gray-900">+${receipt.spreadUsd.toFixed(2)}/oz</span>
          </div>
          <div className="border-t border-gray-200 my-2" />
          <div className="flex justify-between">
            <span className="text-gray-600">Unit Price ({receipt.weightOz} oz)</span>
            <span className="text-gray-900">${unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Quantity</span>
            <span className="text-gray-900">&times; {receipt.quantity}</span>
          </div>
          {receipt.shippingUsd > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">+${receipt.shippingUsd.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 my-2" />
          <div className="flex justify-between">
            <span className="text-gray-900 font-semibold">Total</span>
            <span className="text-gray-900 font-bold text-lg">
              ${receipt.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Fulfillment */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Fulfillment</h2>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Supplier</span>
            <span className="text-gray-900">{receipt.supplier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Type</span>
            <span className="text-gray-900">{receipt.deliveryType === 'DIRECT_SHIP' ? 'Direct Ship' : 'Vault Allocate'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment</span>
            <span className="text-gray-900">{receipt.paymentRail}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {receipt.shipping && receipt.deliveryType === 'DIRECT_SHIP' && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ship To</h2>
          <div className="text-sm text-gray-700">
            <div>{receipt.shipping.name}</div>
            <div>{receipt.shipping.address}</div>
            <div>{receipt.shipping.city}, {receipt.shipping.state} {receipt.shipping.zip}</div>
            {receipt.shipping.country && receipt.shipping.country !== 'US' && (
              <div>{receipt.shipping.country}</div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="border-t border-gray-200 pt-4 mt-8">
        <p className="text-xs text-gray-400 leading-relaxed">
          This receipt is for informational purposes only. Constitutional Tender LLC acts as a marketplace
          facilitating purchases between buyers and authorized suppliers. All precious metals purchases
          involve risk. Past performance of precious metals prices is not indicative of future results.
          Prices shown reflect the locked spot price at the time of order execution.
        </p>
      </div>
    </div>
  );
}
