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

// Display order
const METAL_ORDER = ['XAU', 'XAG', 'XPT', 'XPD'];

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

function MetalTick({ spot }: { spot: MetalSpot }) {
  const label = METAL_LABELS[spot.metal] || spot.metal;
  const symbol = METAL_SYMBOLS[spot.metal] || spot.metal;
  const isPositive = spot.changePct24h >= 0;

  return (
    <div className="flex items-center gap-2 text-sm whitespace-nowrap px-4">
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
}

export function SpotTickerBar({ spots, connectionStatus, lastUpdate }: SpotTickerBarProps) {
  const statusCfg = STATUS_CONFIG[connectionStatus];

  // Sort spots by our preferred order
  const sortedSpots = METAL_ORDER
    .map((m) => spots.find((s) => s.metal === m))
    .filter(Boolean) as MetalSpot[];

  return (
    <div className="bg-sky-400 border-b border-sky-500 relative overflow-hidden">
      <div className="flex items-center">
        {/* Status indicator pinned left */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-sky-400 z-10 border-r border-sky-500/40">
          <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
          <span className="text-sky-800 font-medium text-xs">{statusCfg.label}</span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden py-2">
          <div className="ticker-scroll flex">
            {/* First copy */}
            <div className="flex items-center shrink-0">
              {sortedSpots.map((spot) => (
                <MetalTick key={`a-${spot.metal}`} spot={spot} />
              ))}
              <span className="text-sky-600/50 px-3">|</span>
            </div>
            {/* Second copy (for seamless loop) */}
            <div className="flex items-center shrink-0">
              {sortedSpots.map((spot) => (
                <MetalTick key={`b-${spot.metal}`} spot={spot} />
              ))}
              <span className="text-sky-600/50 px-3">|</span>
            </div>
            {/* Third copy (extra buffer for wide screens) */}
            <div className="flex items-center shrink-0">
              {sortedSpots.map((spot) => (
                <MetalTick key={`c-${spot.metal}`} spot={spot} />
              ))}
              <span className="text-sky-600/50 px-3">|</span>
            </div>
          </div>
        </div>

        {/* Timestamp pinned right */}
        {lastUpdate && (
          <div className="flex-shrink-0 px-3 py-2 bg-sky-400 z-10 border-l border-sky-500/40">
            <span className="text-sky-800 text-xs">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .ticker-scroll {
          animation: ticker-slide 25s linear infinite;
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
}
