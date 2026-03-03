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
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 text-center">
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
            className={`w-full text-left bg-navy-800 border rounded-lg p-4 transition-colors ${
              isSelected
                ? 'border-gold-500/50 bg-gold-500/5'
                : 'border-navy-700 hover:border-navy-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{offer.supplierName}</span>
                {isBest && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-green-900/30 text-green-400">
                    Best Price
                  </span>
                )}
              </div>
              <span className="text-white font-bold">
                ${offer.totalUnitUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-navy-500">Premium</span>
                <div className="text-navy-300">+${offer.premiumUsd.toFixed(2)}/oz</div>
              </div>
              <div>
                <span className="text-navy-500">ETA</span>
                <div className="text-navy-300">{offer.shipEtaDays} day{offer.shipEtaDays !== 1 ? 's' : ''}</div>
              </div>
              <div>
                <span className="text-navy-500">Origin</span>
                <div className="text-navy-300">{offer.shipOrigin}</div>
              </div>
              <div>
                <span className="text-navy-500">Available</span>
                <div className="text-navy-300">{offer.availableQty} units</div>
              </div>
            </div>

            {offer.constraints.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {offer.constraints.map((c, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-navy-700 text-navy-400">
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
