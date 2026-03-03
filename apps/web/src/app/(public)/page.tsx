'use client';

import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';

export default function HomePage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
            Lawful Money.<br />
            <span className="text-gold-400">Modern Execution.</span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-navy-300 max-w-2xl mx-auto">
            Live pricing, transparent spreads, and auditable receipts for gold
            and silver ownership.
          </p>
          <div className="mt-10 flex items-center justify-center space-x-4">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-8 py-3 rounded-md text-lg transition-colors"
              >
                Enter Platform
              </Link>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-8 py-3 rounded-md text-lg transition-colors"
              >
                Enter Platform
              </button>
            )}
            <Link
              href="/how-it-works"
              className="text-navy-300 hover:text-white border border-navy-600 hover:border-navy-400 px-8 py-3 rounded-md text-lg transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-gold-400 text-2xl">$</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Live Pricing</h3>
              <p className="text-sm text-navy-400">
                Real-time spot prices with transparent supplier premiums and platform spreads.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-gold-400 text-2xl">&#x23F1;</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Price Lock</h3>
              <p className="text-sm text-navy-400">
                Lock your execution price for 30 seconds. No slippage during checkout.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-gold-400 text-2xl">&#x2611;</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Auditable Receipts</h3>
              <p className="text-sm text-navy-400">
                Every order includes a timestamped receipt with full price breakdown and settlement timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Transparency */}
      <section className="py-20 border-t border-navy-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Transparent Execution</h2>
          <p className="text-navy-400 mb-10">
            Your execution price is spot + supplier premium + platform spread + shipping (if applicable).
          </p>
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 text-left">
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-navy-400">Spot Price (XAU)</span>
              <span className="text-right text-white font-mono">$2,387.42</span>
              <span className="text-navy-400">Supplier Premium</span>
              <span className="text-right text-white font-mono">+ $24.00</span>
              <span className="text-navy-400">Platform Spread</span>
              <span className="text-right text-white font-mono">+ $4.00</span>
              <span className="text-navy-400">Shipping</span>
              <span className="text-right text-white font-mono">+ $18.00</span>
              <span className="text-navy-400 border-t border-navy-700 pt-3 font-semibold">Execution Price</span>
              <span className="text-right text-gold-400 border-t border-navy-700 pt-3 font-mono font-bold">$2,433.42</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-navy-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">No Leverage. No Derivatives.</h2>
          <p className="text-navy-400 mb-8">Physical metal fulfillment. Direct ship or vault allocation.</p>
          {isAuthenticated ? (
            <Link
              href="/app"
              className="inline-block bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-8 py-3 rounded-md text-lg transition-colors"
            >
              Enter Platform
            </Link>
          ) : (
            <button
              onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-8 py-3 rounded-md text-lg transition-colors"
            >
              Create Account
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
