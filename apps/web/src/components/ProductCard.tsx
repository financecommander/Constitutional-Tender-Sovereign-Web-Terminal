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
  XAU: 'from-gold-500/16 to-transparent',
  XAG: 'from-slate-300/10 to-transparent',
  XPT: 'from-sky-400/10 to-transparent',
  XPD: 'from-emerald-400/10 to-transparent',
};

interface ProductCardProps {
  product: ProductListing;
}

export function ProductCard({ product }: ProductCardProps) {
  const metalLabel = METAL_LABELS[product.metal] || product.metal;
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const metalColor = METAL_COLORS[product.metal] || 'from-white/5 to-transparent';
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
      className={`group block rounded-[26px] border border-white/8 bg-gradient-to-r ${metalColor} bg-[linear-gradient(180deg,rgba(19,34,53,0.96),rgba(12,24,39,0.94))] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:border-gold-500/20`}
    >
      {/* Product image placeholder + details */}
      <div className="flex gap-4">
        {/* Image placeholder */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] border border-white/8 bg-navy-800/70 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl sm:text-3xl opacity-70">
            {product.metal === 'XAU' ? '◉' : product.metal === 'XAG' ? '◎' : product.metal === 'XPT' ? '◇' : '◌'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400/80">{metalLabel}</span>
                {product.flags.includes('IRA_ELIGIBLE') && (
                  <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-gold-300">
                    IRA eligible
                  </span>
                )}
              </div>
              <h3 className="font-display text-white font-semibold group-hover:text-gold-300 transition-colors text-xl sm:text-[1.7rem] leading-none">
                {product.name}
              </h3>
              <p className="text-navy-400 text-xs mt-2">
                {product.weightOz} oz &middot; {(product.purity * 100).toFixed(product.purity >= 0.999 ? 2 : 1)}% &middot; {categoryLabel}
              </p>
            </div>
            <span className="text-[10px] text-navy-500 font-mono uppercase tracking-[0.18em] shrink-0">{product.sku}</span>
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              {product.bestOfferTotalUsd !== null ? (
                <>
                  <div className="text-2xl sm:text-[2rem] font-semibold text-white font-display">
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
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
        <div className="flex items-center gap-3 text-xs text-navy-400 flex-wrap">
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
            className="rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-300 transition-colors hover:bg-gold-500/18"
          >
            Add to cart
          </button>
        )}
      </div>
    </Link>
  );
}
