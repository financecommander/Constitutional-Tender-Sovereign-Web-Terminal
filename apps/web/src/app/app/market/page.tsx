'use client';

import { useState, useMemo } from 'react';
import { useSpotStream } from '@/hooks/use-spot-stream';
import { useProducts } from '@/hooks/use-products';
import { MetalTile } from '@/components/MetalTile';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';

const METALS = [
  { value: '', label: 'All Metals' },
  { value: 'XAU', label: 'Gold' },
  { value: 'XAG', label: 'Silver' },
  { value: 'XPT', label: 'Platinum' },
  { value: 'XPD', label: 'Palladium' },
];

const CATEGORIES = [
  { value: '', label: 'All Types' },
  { value: 'COIN', label: 'Coins' },
  { value: 'BAR', label: 'Bars' },
  { value: 'ROUND', label: 'Rounds' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'weight', label: 'Weight: Light First' },
  { value: 'weight_desc', label: 'Weight: Heavy First' },
  { value: 'name', label: 'Name: A-Z' },
];

export default function MarketPage() {
  const { spots, connectionStatus } = useSpotStream();
  const { data: products, isLoading } = useProducts();

  const [search, setSearch] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let items = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    // Metal filter
    if (metalFilter) {
      items = items.filter((p) => p.metal === metalFilter);
    }

    // Category filter
    if (categoryFilter) {
      items = items.filter((p) => p.category === categoryFilter);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        items.sort((a, b) => (a.bestOfferTotalUsd ?? Infinity) - (b.bestOfferTotalUsd ?? Infinity));
        break;
      case 'price_desc':
        items.sort((a, b) => (b.bestOfferTotalUsd ?? 0) - (a.bestOfferTotalUsd ?? 0));
        break;
      case 'weight':
        items.sort((a, b) => a.weightOz - b.weightOz);
        break;
      case 'weight_desc':
        items.sort((a, b) => b.weightOz - a.weightOz);
        break;
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return items;
  }, [products, search, metalFilter, categoryFilter, sortBy]);

  const activeFilterCount = [metalFilter, categoryFilter, sortBy].filter(Boolean).length;

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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      {/* Shop by Metal */}
      <div>
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Shop by Metal</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { metal: 'gold', symbol: 'Au', color: 'text-gold-400 bg-gold-500/10' },
            { metal: 'silver', symbol: 'Ag', color: 'text-navy-300 bg-navy-600/30' },
            { metal: 'platinum', symbol: 'Pt', color: 'text-blue-400 bg-blue-500/10' },
            { metal: 'palladium', symbol: 'Pd', color: 'text-emerald-400 bg-emerald-500/10' },
          ].map(({ metal, symbol, color }) => (
            <Link
              key={metal}
              href={`/app/metals/${metal}`}
              className="bg-navy-800 border border-navy-700 rounded-lg p-4 hover:border-gold-500/30 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${color} text-xs font-bold`}>
                  {symbol}
                </span>
                <div>
                  <h3 className="text-white font-semibold text-sm group-hover:text-gold-400 transition-colors capitalize">
                    {metal}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full bg-navy-800 border border-navy-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-navy-500 focus:border-gold-500/50 focus:outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-white text-sm"
              >
                &times;
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                : 'bg-navy-800 border-navy-700 text-navy-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-gold-500 text-navy-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter dropdowns */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 bg-navy-800/50 border border-navy-700/50 rounded-lg p-4">
            <div>
              <label className="block text-xs text-navy-500 mb-1">Metal</label>
              <select
                value={metalFilter}
                onChange={(e) => setMetalFilter(e.target.value)}
                className="bg-navy-900 border border-navy-700 rounded px-3 py-1.5 text-white text-sm focus:border-gold-500 focus:outline-none min-w-[130px]"
              >
                {METALS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-navy-500 mb-1">Type</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-navy-900 border border-navy-700 rounded px-3 py-1.5 text-white text-sm focus:border-gold-500 focus:outline-none min-w-[130px]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-navy-500 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-navy-900 border border-navy-700 rounded px-3 py-1.5 text-white text-sm focus:border-gold-500 focus:outline-none min-w-[170px]"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <button
                  onClick={() => { setMetalFilter(''); setCategoryFilter(''); setSortBy(''); }}
                  className="text-xs text-navy-400 hover:text-white transition-colors px-3 py-1.5 rounded bg-navy-700 hover:bg-navy-600"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">
            Products {!isLoading && `(${filtered.length})`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-navy-800 border border-navy-700 rounded-lg p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-12 text-center">
            <p className="text-navy-400 text-sm">
              {search || activeFilterCount > 0
                ? 'No products match your search criteria.'
                : 'No products available.'}
            </p>
            {(search || activeFilterCount > 0) && (
              <button
                onClick={() => { setSearch(''); setMetalFilter(''); setCategoryFilter(''); setSortBy(''); }}
                className="text-gold-400 hover:text-gold-300 text-sm mt-2"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
