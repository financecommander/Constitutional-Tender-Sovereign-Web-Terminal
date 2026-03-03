'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useProductDetail, OfferDetail } from '@/hooks/use-products';
import { useSpotStream } from '@/hooks/use-spot-stream';
import { MetalTile } from '@/components/MetalTile';
import { SupplierOfferList } from '@/components/SupplierOfferList';
import { QuoteLockPanel } from '@/components/QuoteLockPanel';
import Link from 'next/link';

const METAL_LABELS: Record<string, string> = {
  XAU: 'Gold',
  XAG: 'Silver',
  XPT: 'Platinum',
  XPD: 'Palladium',
};

export default function ProductDetailPage() {
  const params = useParams();
  const sku = params.sku as string;
  const { data, isLoading, error } = useProductDetail(sku);
  const { spots, connectionStatus } = useSpotStream();
  const [selectedOffer, setSelectedOffer] = useState<OfferDetail | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-navy-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 animate-pulse h-48" />
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 animate-pulse h-48" />
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 animate-pulse h-48" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Product Not Found</h1>
        <p className="text-navy-400">{error || `No product with SKU "${sku}"`}</p>
        <Link href="/app/market" className="text-gold-400 hover:text-gold-300 text-sm">
          Back to Market
        </Link>
      </div>
    );
  }

  const { product, spotPerOz, offers } = data;
  const spot = spots.find((s) => s.metal === product.metal);
  const liveSpot = spot?.spotUsdPerOz ?? spotPerOz;
  const metalLabel = METAL_LABELS[product.metal] || product.metal;

  const activeOffer = selectedOffer || offers[0] || null;
  const unitTotal = activeOffer
    ? (liveSpot + activeOffer.premiumUsd) * product.weightOz
    : null;
  const orderTotal = unitTotal !== null ? unitTotal * quantity : null;

  const isStale = connectionStatus === 'stale' || connectionStatus === 'disconnected';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-navy-400">
        <Link href="/app/market" className="hover:text-white transition-colors">Market</Link>
        <span>/</span>
        <Link
          href={`/app/metals/${metalLabel.toLowerCase()}`}
          className="hover:text-white transition-colors"
        >
          {metalLabel}
        </Link>
        <span>/</span>
        <span className="text-white">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Market + Spot */}
        <div className="space-y-4">
          {spot && <MetalTile spot={spot} />}

          <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Product Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-400">SKU</span>
                <span className="text-white font-mono">{product.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Metal</span>
                <span className="text-white">{metalLabel} ({product.metal})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Weight</span>
                <span className="text-white">{product.weightOz} oz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Purity</span>
                <span className="text-white">{(product.purity * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Category</span>
                <span className="text-white">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Delivery</span>
                <span className="text-white">{product.eligibleDeliveryTypes.join(', ')}</span>
              </div>
            </div>
            {product.flags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {product.flags.map((flag) => (
                  <span key={flag} className="px-2 py-0.5 rounded text-xs bg-gold-500/10 text-gold-400">
                    {flag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Supplier Offers */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">
            Supplier Offers ({offers.length})
          </h2>
          <SupplierOfferList
            offers={offers}
            onSelectOffer={setSelectedOffer}
            selectedOfferId={activeOffer?.id}
          />
        </div>

        {/* Column 3: Quote + CTA */}
        <div className="space-y-4">
          {/* Live Price Preview */}
          {activeOffer && unitTotal !== null && (
            <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">
                Live Estimate
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-navy-400">Spot</span>
                  <span className="text-white">${liveSpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/oz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">Premium</span>
                  <span className="text-white">+${activeOffer.premiumUsd.toFixed(2)}/oz</span>
                </div>
                <div className="border-t border-navy-700 my-1" />
                <div className="flex justify-between">
                  <span className="text-navy-400">Unit</span>
                  <span className="text-white font-semibold">
                    ${unitTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-3">
                <label className="block text-xs text-navy-400 mb-1">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded bg-navy-700 text-white hover:bg-navy-600 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={activeOffer.availableQty}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(activeOffer.availableQty, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center bg-navy-900 border border-navy-700 rounded px-2 py-1 text-white text-sm"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(activeOffer.availableQty, quantity + 1))}
                    className="w-8 h-8 rounded bg-navy-700 text-white hover:bg-navy-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-3 bg-navy-900 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-navy-400 text-sm">Est. Total</span>
                  <span className="text-xl font-bold text-gold-400">
                    ${orderTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quote Lock Panel */}
          {activeOffer ? (
            <QuoteLockPanel
              sku={product.sku}
              offerId={activeOffer.id}
              quantity={quantity}
              deliveryType={product.eligibleDeliveryTypes[0] || 'DIRECT_SHIP'}
              disabled={isStale}
            />
          ) : (
            <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
              <p className="text-navy-400 text-sm text-center">
                Select an offer to see pricing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
