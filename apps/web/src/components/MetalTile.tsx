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
    <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(19,34,53,0.92),rgba(11,24,41,0.9))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-0.5 hover:border-gold-500/20">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gold-500/10 text-gold-300 text-xs font-bold">
            {symbol}
          </span>
          <span className="text-sm font-medium text-navy-200">{label}</span>
        </div>
        <span className="text-xs text-navy-500 uppercase tracking-[0.2em]">{spot.metal}</span>
      </div>

      <div className="text-3xl font-semibold text-white font-display mb-1">
        ${spot.spotUsdPerOz.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${changeColor}`}>
          {changePrefix}{spot.changePct24h.toFixed(2)}%
        </span>
        <span className="text-xs text-navy-500 uppercase tracking-[0.18em]">per oz</span>
      </div>
    </div>
  );
}
