'use client';

import { MetalSpot } from '@/types/api';
import { ConnectionStatus } from '@/hooks/use-spot-stream';

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

interface SpotTickerBarProps {
  spots: MetalSpot[];
  connectionStatus: ConnectionStatus;
  lastUpdate: string | null;
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; dotClass: string }> = {
  connected: { label: 'Live', dotClass: 'bg-green-600' },
  connecting: { label: 'Connecting', dotClass: 'bg-yellow-500 animate-pulse' },
  disconnected: { label: 'Offline', dotClass: 'bg-red-500' },
  stale: { label: 'Stale', dotClass: 'bg-orange-500 animate-pulse' },
};

export function SpotTickerBar({ spots, connectionStatus, lastUpdate }: SpotTickerBarProps) {
  const statusCfg = STATUS_CONFIG[connectionStatus];

  return (
    <div className="bg-sky-400 border-b border-sky-500 px-4 py-2 overflow-x-auto">
      <div className="flex items-center justify-between min-w-max">
        <div className="flex items-center gap-6">
          {spots.map((spot) => {
            const label = METAL_LABELS[spot.metal] || spot.metal;
            const symbol = METAL_SYMBOLS[spot.metal] || spot.metal;
            const isPositive = spot.changePct24h >= 0;

            return (
              <div key={spot.metal} className="flex items-center gap-2 text-sm">
                <span className="bg-sky-500/60 text-sky-900 font-bold text-xs px-1.5 py-0.5 rounded">
                  {symbol}
                </span>
                <span className="text-sky-900 font-medium">{label}</span>
                <span className="text-navy-900 font-bold">
                  ${spot.spotUsdPerOz.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-semibold ${isPositive ? 'text-green-800' : 'text-red-800'}`}>
                  {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{spot.changePct24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs ml-4">
          {lastUpdate && (
            <span className="text-sky-800">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
            <span className="text-sky-800 font-medium">{statusCfg.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
