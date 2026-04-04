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
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <div className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(145deg,rgba(10,22,39,0.96),rgba(8,17,29,0.82))] px-8 py-10 shadow-[0_28px_90px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-x-[48%] bottom-[-12%] h-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="relative z-10">
            <p className="text-[11px] uppercase tracking-[0.26em] text-gold-400/90">Physical metals marketplace</p>
            <h1 className="mt-4 max-w-[10ch] text-5xl sm:text-6xl leading-[0.9] text-white font-display">
              Acquire sovereign metals with institutional-grade clarity.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-navy-300">
              Live spot, transparent premiums, verified shipping, and IRA-ready inventory in a market surface that feels like a private desk instead of a commodity cart.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-gold-500 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-navy-950">
                Buy Metals
              </button>
              <Link
                href="/app/savings"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm uppercase tracking-[0.14em] text-navy-200 transition-colors hover:text-white"
              >
                Review Savings
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-navy-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Allocated vaulting</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Insured fulfillment</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">IRA eligible inventory</span>
            </div>
          </div>
        </div>

        <aside className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,33,53,0.94),rgba(10,21,35,0.92))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-gold-400/80">Desk note</p>
              <h2 className="mt-2 text-3xl text-white font-display">Live market board</h2>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
              connectionStatus === 'connected'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300'
            }`}>
              <span className={`h-2 w-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
              {connectionStatus === 'connected' ? 'Streaming' : 'Connecting'}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-navy-300">
            Gold Eagles and PAMP bars are leading intake today, with wire demand concentrated in IRA-eligible lots.
          </p>

          <div className="mt-6 space-y-3">
            {spots.length > 0 ? (
              spots.map((spot) => <MetalTile key={spot.metal} spot={spot} />)
            ) : (
              <div className="rounded-[24px] border border-white/8 bg-white/5 p-8 text-center">
                <p className="text-sm text-navy-400">
                  {connectionStatus === 'connecting'
                    ? 'Connecting to price feed...'
                    : connectionStatus === 'disconnected'
                      ? 'Price feed unavailable. Reconnecting...'
                      : 'Loading spot prices...'}
                </p>
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[24px] border border-white/8 bg-white/5 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold-400/80">Execution</p>
          <p className="mt-3 text-3xl text-white font-display">{filtered.length || products.length} live lots</p>
          <p className="mt-2 text-sm leading-7 text-navy-400">Priority inventory with transparent premium disclosure and visible fulfillment status.</p>
        </article>
        <article className="rounded-[24px] border border-white/8 bg-white/5 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold-400/80">Trust</p>
          <p className="mt-3 text-3xl text-white font-display">Insured settlement</p>
          <p className="mt-2 text-sm leading-7 text-navy-400">Listings surface verification, shipment protection, and custody suitability without burying it in detail pages.</p>
        </article>
        <article className="rounded-[24px] border border-white/8 bg-white/5 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold-400/80">Access</p>
          <p className="mt-3 text-3xl text-white font-display">Wire-favored pricing</p>
          <p className="mt-2 text-sm leading-7 text-navy-400">Encourage desk-grade purchase behavior with stronger payment-rail cues and less retail-cart visual language.</p>
        </article>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold-400/80">Shop by metal</p>
            <h2 className="mt-2 text-4xl text-white font-display">Today&apos;s premium market</h2>
          </div>
        </div>
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
              className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(19,34,53,0.92),rgba(11,24,41,0.9))] p-4 transition-all hover:-translate-y-0.5 hover:border-gold-500/20 group"
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
      </section>

      {/* Search + Filter Bar */}
      <section className="space-y-4">
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
              className="w-full rounded-[22px] border border-white/8 bg-white/5 pl-10 pr-4 py-3 text-white text-sm placeholder:text-navy-500 focus:border-gold-500/40 focus:outline-none transition-colors"
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
            className={`flex items-center gap-2 px-4 py-3 rounded-[22px] text-sm border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-gold-500/10 border-gold-500/30 text-gold-300'
                : 'bg-white/5 border-white/8 text-navy-400 hover:text-white'
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
          <div className="flex flex-wrap gap-3 rounded-[24px] border border-white/8 bg-white/5 p-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.16em] text-navy-500 mb-2">Metal</label>
              <select
                value={metalFilter}
                onChange={(e) => setMetalFilter(e.target.value)}
                className="bg-navy-950/70 border border-white/8 rounded-xl px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none min-w-[130px]"
              >
                {METALS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.16em] text-navy-500 mb-2">Type</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-navy-950/70 border border-white/8 rounded-xl px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none min-w-[130px]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.16em] text-navy-500 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-navy-950/70 border border-white/8 rounded-xl px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none min-w-[170px]"
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
                  className="text-xs text-navy-300 hover:text-white transition-colors px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Products Grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">
            Products {!isLoading && `(${filtered.length})`}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[24px] border border-white/8 bg-white/5 p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-white/8 bg-white/5 p-12 text-center">
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
      </section>
    </div>
  );
}
