'use client';

import { useSpotStream } from '@/hooks/use-spot-stream';
import { MetalTile } from '@/components/MetalTile';
import Link from 'next/link';

export default function MarketPage() {
  const { spots, connectionStatus } = useSpotStream();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Market</h1>
        <p className="mt-1 text-navy-400">Live spot prices and product catalog.</p>
      </div>

      {/* Spot Prices */}
      <div>
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Spot Prices</h2>
        {spots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {spots.map((spot) => (
              <MetalTile key={spot.metal} spot={spot} />
            ))}
          </div>
        ) : (
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 text-center">
            <p className="text-navy-400 text-sm">
              {connectionStatus === 'connecting'
                ? 'Connecting to price feed...'
                : connectionStatus === 'disconnected'
                  ? 'Price feed unavailable. Reconnecting...'
                  : 'Loading spot prices...'}
            </p>
          </div>
        )}
      </div>

      {/* Product Categories */}
      <div>
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Shop by Metal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/app/metals/gold"
            className="bg-navy-800 border border-navy-700 rounded-lg p-6 hover:border-gold-500/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gold-500/10 text-gold-400 text-sm font-bold">
                Au
              </span>
              <div>
                <h3 className="text-white font-semibold group-hover:text-gold-400 transition-colors">Gold Products</h3>
                <p className="text-navy-400 text-sm">Coins, bars, and rounds</p>
              </div>
            </div>
          </Link>
          <Link
            href="/app/metals/silver"
            className="bg-navy-800 border border-navy-700 rounded-lg p-6 hover:border-navy-500/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-navy-600/30 text-navy-300 text-sm font-bold">
                Ag
              </span>
              <div>
                <h3 className="text-white font-semibold group-hover:text-navy-300 transition-colors">Silver Products</h3>
                <p className="text-navy-400 text-sm">Coins, bars, and rounds</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
