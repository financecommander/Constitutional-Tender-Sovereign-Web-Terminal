'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useProductDetail, OfferDetail } from '@/hooks/use-products';
import { useSpotStream } from '@/hooks/use-spot-stream';
import { useCart } from '@/hooks/use-cart';
import { MetalTile } from '@/components/MetalTile';
import { SupplierOfferList } from '@/components/SupplierOfferList';
import { QuoteLockPanel } from '@/components/QuoteLockPanel';
import { ProductReviews } from '@/components/ProductReviews';
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
  const { addItem } = useCart();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-navy-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="border border-white/8 rounded-[24px] p-6 animate-pulse h-48 bg-white/5" />
          <div className="border border-white/8 rounded-[24px] p-6 animate-pulse h-48 bg-white/5" />
          <div className="border border-white/8 rounded-[24px] p-6 animate-pulse h-48 bg-white/5" />
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
    <div className="space-y-8">
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

      <section className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(145deg,rgba(10,22,39,0.96),rgba(8,17,29,0.82))] px-8 py-10 shadow-[0_28px_90px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-x-[48%] bottom-[-14%] h-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold-300">{metalLabel}</span>
              <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-navy-300">{product.category}</span>
              {product.flags.map((flag) => (
                <span key={flag} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-navy-300">
                  {flag.replaceAll('_', ' ')}
                </span>
              ))}
            </div>
            <h1 className="mt-5 font-display text-5xl sm:text-6xl leading-[0.92] text-white max-w-[12ch]">{product.name}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-navy-300">
              Live spot references, supplier-level offers, secure quote locking, and custody-aware delivery options for this {metalLabel.toLowerCase()} listing.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gold-400/80">SKU</p>
                <p className="mt-2 text-white text-sm font-mono">{product.sku}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gold-400/80">Weight</p>
                <p className="mt-2 text-white text-sm">{product.weightOz} oz</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gold-400/80">Purity</p>
                <p className="mt-2 text-white text-sm">{(product.purity * 100).toFixed(2)}%</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gold-400/80">Delivery</p>
                <p className="mt-2 text-white text-sm">{product.eligibleDeliveryTypes.join(', ')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,33,53,0.94),rgba(10,21,35,0.92))] p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400/80">Live estimate</p>
            {activeOffer && unitTotal !== null ? (
              <>
                <div className="mt-4">
                  <p className="text-navy-400 text-sm">Current unit estimate</p>
                  <p className="mt-1 font-display text-5xl text-white">
                    ${unitTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="mt-5 rounded-[22px] border border-white/8 bg-white/5 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400">Spot</span>
                    <span className="text-white">${liveSpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/oz</span>
                  </div>
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-navy-400">Premium</span>
                    <span className="text-white">+${activeOffer.premiumUsd.toFixed(2)}/oz</span>
                  </div>
                  <div className="mt-3 border-t border-white/8 pt-3 flex justify-between text-sm">
                    <span className="text-navy-400">Selected offer</span>
                    <span className="text-white">{activeOffer.supplierName}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-navy-400">Select an offer to view live pricing.</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Market + Spot */}
        <div className="space-y-4">
          {spot && <MetalTile spot={spot} />}

          <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,33,53,0.94),rgba(10,21,35,0.92))] p-6">
            <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-[0.2em] mb-4">Product Details</h3>
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
          </div>
        </div>

        {/* Column 2: Supplier Offers */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-navy-300 uppercase tracking-[0.2em]">
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
            <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,33,53,0.94),rgba(10,21,35,0.92))] p-6">
              <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-[0.2em] mb-4">
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
                <div className="border-t border-white/8 my-1" />
                <div className="flex justify-between">
                  <span className="text-navy-400">Unit</span>
                  <span className="font-display text-2xl text-white">
                    ${unitTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-5">
                <label className="block text-xs uppercase tracking-[0.16em] text-navy-400 mb-2">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/8 text-white hover:bg-white/10 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={activeOffer.availableQty}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(activeOffer.availableQty, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center bg-navy-950/70 border border-white/8 rounded-xl px-2 py-2 text-white text-sm"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(activeOffer.availableQty, quantity + 1))}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/8 text-white hover:bg-white/10 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/8 bg-white/5 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-navy-400 text-sm">Est. Total</span>
                  <span className="font-display text-3xl text-gold-300">
                    ${orderTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          {activeOffer && unitTotal !== null && (
            <button
              onClick={() => addItem({
                sku: product.sku,
                name: product.name,
                metal: product.metal,
                weightOz: product.weightOz,
                quantity,
                bestOfferTotalUsd: unitTotal,
              })}
              className="w-full rounded-full py-3 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold text-sm uppercase tracking-[0.14em] transition-colors"
            >
              Add to Cart — ${orderTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </button>
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
            <div className="rounded-[28px] border border-white/8 bg-white/5 p-5">
              <p className="text-navy-400 text-sm text-center">
                Select an offer to see pricing
              </p>
            </div>
          )}

          {/* Trust Signals */}
          <div className="rounded-[28px] border border-white/8 bg-white/5 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-navy-400">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Fully insured shipping</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-400">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure checkout with price lock</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-400">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Save 4% with Wire/ACH payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ProductReviews sku={product.sku} />
    </div>
  );
}
