'use client';

import Link from 'next/link';
import { ProductListing } from '@/hooks/use-products';
import { useCart } from '@/hooks/use-cart';

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

const METAL_COLORS: Record<string, string> = {
  XAU: 'border-l-gold-500',
  XAG: 'border-l-navy-400',
  XPT: 'border-l-blue-400',
  XPD: 'border-l-emerald-400',
};

interface ProductCardProps {
  product: ProductListing;
}

export function ProductCard({ product }: ProductCardProps) {
  const metalLabel = METAL_LABELS[product.metal] || product.metal;
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const metalColor = METAL_COLORS[product.metal] || 'border-l-navy-500';
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      sku: product.sku,
      name: product.name,
      metal: product.metal,
      weightOz: product.weightOz,
      quantity: 1,
      bestOfferTotalUsd: product.bestOfferTotalUsd,
    });
  };

  return (
    <Link
      href={`/app/product/${product.sku}`}
      className={`block bg-navy-800 border border-navy-700 border-l-4 ${metalColor} rounded-lg p-5 hover:border-gold-500/30 transition-colors group`}
    >
      {/* Product image placeholder + details */}
      <div className="flex gap-4">
        {/* Image placeholder */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-navy-700/50 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl sm:text-3xl opacity-60">
            {product.metal === 'XAU' ? '🪙' : product.metal === 'XAG' ? '🥈' : product.metal === 'XPT' ? '💠' : '💎'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-white font-semibold group-hover:text-gold-400 transition-colors text-sm sm:text-base">
                {product.name}
              </h3>
              <p className="text-navy-400 text-xs mt-0.5">
                {product.weightOz} oz &middot; {(product.purity * 100).toFixed(product.purity >= 0.999 ? 2 : 1)}% &middot; {categoryLabel}
              </p>
            </div>
            <span className="text-xs text-navy-500 font-mono shrink-0">{product.sku}</span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              {product.bestOfferTotalUsd !== null ? (
                <>
                  <div className="text-lg sm:text-xl font-bold text-white">
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
        </div>
      </div>

      {/* Trust signals + Add to Cart */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy-700/50">
        <div className="flex items-center gap-3 text-xs text-navy-500">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
          <span>Insured Shipping</span>
          {product.bestOfferTotalUsd && (
            <span className="text-green-400">
              Save 4% with Wire
            </span>
          )}
        </div>
        {product.bestOfferTotalUsd !== null && (
          <button
            onClick={handleAddToCart}
            className="px-3 py-1 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 text-xs rounded transition-colors"
          >
            + Cart
          </button>
        )}
      </div>
    </Link>
  );
}
