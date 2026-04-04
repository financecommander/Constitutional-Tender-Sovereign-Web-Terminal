'use client';

import { OfferDetail } from '@/hooks/use-products';

interface SupplierOfferListProps {
  offers: OfferDetail[];
  onSelectOffer?: (offer: OfferDetail) => void;
  selectedOfferId?: string;
}

export function SupplierOfferList({ offers, onSelectOffer, selectedOfferId }: SupplierOfferListProps) {
  if (offers.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/8 bg-white/5 p-6 text-center">
        <p className="text-navy-400 text-sm">No supplier offers available for this product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {offers.map((offer, idx) => {
        const isSelected = selectedOfferId === offer.id;
        const isBest = idx === 0;

        return (
          <button
            key={offer.id}
            onClick={() => onSelectOffer?.(offer)}
            className={`w-full text-left rounded-[24px] border p-5 transition-all ${
              isSelected
                ? 'border-gold-500/40 bg-gold-500/8 shadow-[0_18px_45px_rgba(0,0,0,0.15)]'
                : 'border-white/8 bg-[linear-gradient(180deg,rgba(19,34,53,0.92),rgba(11,24,41,0.9))] hover:border-gold-500/18'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{offer.supplierName}</span>
                {isBest && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-300">
                    Best Price
                  </span>
                )}
              </div>
              <span className="font-display text-2xl text-white">
                ${offer.totalUnitUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-navy-500 uppercase tracking-[0.14em]">Premium</span>
                <div className="mt-1 text-navy-300">+${offer.premiumUsd.toFixed(2)}/oz</div>
              </div>
              <div>
                <span className="text-navy-500 uppercase tracking-[0.14em]">ETA</span>
                <div className="mt-1 text-navy-300">{offer.shipEtaDays} day{offer.shipEtaDays !== 1 ? 's' : ''}</div>
              </div>
              <div>
                <span className="text-navy-500 uppercase tracking-[0.14em]">Origin</span>
                <div className="mt-1 text-navy-300">{offer.shipOrigin}</div>
              </div>
              <div>
                <span className="text-navy-500 uppercase tracking-[0.14em]">Available</span>
                <div className="mt-1 text-navy-300">{offer.availableQty} units</div>
              </div>
            </div>

            {offer.constraints.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {offer.constraints.map((c, i) => (
                  <span key={i} className="rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-navy-400">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
