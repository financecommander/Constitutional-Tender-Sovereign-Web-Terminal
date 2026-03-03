'use client';

import Link from 'next/link';
import { ProductListing } from '@/hooks/use-products';

const METAL_LABELS: Record<string, string> = {
  XAU: 'Gold',
  XAG: 'Silver',
  XPT: 'Platinum',
  XPD: 'Palladium',
};

const CATEGORY_LABELS: Record<string, string> = {
  COIN: 'Coin',
  BAR: 'Bar',
  ROUND: 'Round',
};

interface ProductCardProps {
  product: ProductListing;
}

export function ProductCard({ product }: ProductCardProps) {
  const metalLabel = METAL_LABELS[product.metal] || product.metal;
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

  return (
    <Link
      href={`/app/product/${product.sku}`}
      className="block bg-navy-800 border border-navy-700 rounded-lg p-5 hover:border-gold-500/30 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-navy-400 text-xs mt-0.5">
            {product.weightOz} oz &middot; {(product.purity * 100).toFixed(product.purity >= 0.999 ? 2 : 1)}% &middot; {categoryLabel}
          </p>
        </div>
        <span className="text-xs text-navy-500 font-mono">{product.sku}</span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          {product.bestOfferTotalUsd !== null ? (
            <>
              <div className="text-xl font-bold text-white">
                ${product.bestOfferTotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-navy-400">
                +${product.bestOfferPremiumUsd?.toFixed(2)}/oz premium
              </div>
            </>
          ) : (
            <div className="text-sm text-navy-500">No offers available</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {product.flags.map((flag) => (
            <span
              key={flag}
              className="px-2 py-0.5 rounded text-xs bg-gold-500/10 text-gold-400"
            >
              {flag}
            </span>
          ))}
          {product.offerCount > 0 && (
            <span className="text-xs text-navy-500">
              {product.offerCount} offer{product.offerCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
