'use client';

interface PriceBreakdownProps {
  spotUsd: number;
  premiumUsd: number;
  spreadUsd: number;
  shippingUsd: number;
  weightOz: number;
  quantity: number;
  totalUsd: number;
}

export function PriceBreakdown({
  spotUsd,
  premiumUsd,
  spreadUsd,
  shippingUsd,
  weightOz,
  quantity,
  totalUsd,
}: PriceBreakdownProps) {
  const unitPrice = (spotUsd + premiumUsd + spreadUsd) * weightOz;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-navy-400">Spot Price</span>
        <span className="text-white">${spotUsd.toFixed(2)}/oz</span>
      </div>
      <div className="flex justify-between">
        <span className="text-navy-400">Supplier Premium</span>
        <span className="text-white">+${premiumUsd.toFixed(2)}/oz</span>
      </div>
      <div className="flex justify-between">
        <span className="text-navy-400">Platform Spread</span>
        <span className="text-white">+${spreadUsd.toFixed(2)}/oz</span>
      </div>
      <div className="flex justify-between">
        <span className="text-navy-400">Weight</span>
        <span className="text-white">{weightOz} oz</span>
      </div>
      <div className="border-t border-navy-700 my-1" />
      <div className="flex justify-between">
        <span className="text-navy-400">Unit Price</span>
        <span className="text-white">${unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-navy-400">Quantity</span>
        <span className="text-white">&times; {quantity}</span>
      </div>
      {shippingUsd > 0 && (
        <div className="flex justify-between">
          <span className="text-navy-400">Shipping</span>
          <span className="text-white">+${shippingUsd.toFixed(2)}</span>
        </div>
      )}
      <div className="border-t border-navy-700 my-1" />
      <div className="flex justify-between items-center">
        <span className="text-white font-semibold">Total</span>
        <span className="text-xl font-bold text-gold-400">
          ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
