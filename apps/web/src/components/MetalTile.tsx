'use client';

import { MetalSpot } from '@/types/api';

const METAL_LABELS: Record<string, string> = {
  XAU: 'Gold',
  XAG: 'Silver',
  XPT: 'Platinum',
  XPD: 'Palladium',
};

const METAL_SYMBOLS: Record<string, string> = {
  XAU: 'Au',
  XAG: 'Ag',
  XPT: 'Pt',
  XPD: 'Pd',
};

interface MetalTileProps {
  spot: MetalSpot;
}

export function MetalTile({ spot }: MetalTileProps) {
  const label = METAL_LABELS[spot.metal] || spot.metal;
  const symbol = METAL_SYMBOLS[spot.metal] || spot.metal;
  const isPositive = spot.changePct24h >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const changePrefix = isPositive ? '+' : '';

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-lg p-5 hover:border-gold-500/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/10 text-gold-400 text-xs font-bold">
            {symbol}
          </span>
          <span className="text-sm font-medium text-navy-300">{label}</span>
        </div>
        <span className="text-xs text-navy-500 uppercase">{spot.metal}</span>
      </div>

      <div className="text-2xl font-bold text-white mb-1">
        ${spot.spotUsdPerOz.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${changeColor}`}>
          {changePrefix}{spot.changePct24h.toFixed(2)}%
        </span>
        <span className="text-xs text-navy-500">per oz</span>
      </div>
    </div>
  );
}
