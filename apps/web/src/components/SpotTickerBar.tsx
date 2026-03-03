'use client';

import { MetalSpot } from '@/types/api';
import { ConnectionStatus } from '@/hooks/use-spot-stream';

const METAL_LABELS: Record<string, string> = {
  XAU: 'Gold',
  XAG: 'Silver',
  XPT: 'Platinum',
  XPD: 'Palladium',
};

interface SpotTickerBarProps {
  spots: MetalSpot[];
  connectionStatus: ConnectionStatus;
  lastUpdate: string | null;
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; dotClass: string }> = {
  connected: { label: 'Live', dotClass: 'bg-green-400' },
  connecting: { label: 'Connecting', dotClass: 'bg-yellow-400 animate-pulse' },
  disconnected: { label: 'Offline', dotClass: 'bg-red-400' },
  stale: { label: 'Stale', dotClass: 'bg-orange-400 animate-pulse' },
};

export function SpotTickerBar({ spots, connectionStatus, lastUpdate }: SpotTickerBarProps) {
  const statusCfg = STATUS_CONFIG[connectionStatus];

  return (
    <div className="bg-navy-800/80 border-b border-navy-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {spots.map((spot) => {
            const label = METAL_LABELS[spot.metal] || spot.metal;
            const isPositive = spot.changePct24h >= 0;

            return (
              <div key={spot.metal} className="flex items-center gap-2 text-sm">
                <span className="text-navy-400 font-medium">{label}</span>
                <span className="text-white font-semibold">
                  ${spot.spotUsdPerOz.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{spot.changePct24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs">
          {lastUpdate && (
            <span className="text-navy-500">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
            <span className="text-navy-400">{statusCfg.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
