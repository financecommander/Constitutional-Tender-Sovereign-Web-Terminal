'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import { useCart } from '@/hooks/use-cart';
import { CartDrawer } from '@/components/CartDrawer';
import { MobileNav } from '@/components/MobileNav';

export function Header() {
  const { logout, user, isAuthenticated, isLoading } = useAuth0();
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="bg-navy-900 text-white border-b border-navy-700/50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          {/* Left: Mobile nav + Logo */}
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/app" className="flex items-center space-x-3">
              {/* Gold brick logo with "C" */}
              <div className="relative w-9 h-7 flex items-center justify-center" style={{ perspective: '200px' }}>
                <div
                  className="w-full h-full rounded-sm flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #d4a438, #b8860b 30%, #daa520 50%, #b8860b 70%, #996515)',
                    boxShadow: 'inset 0 1px 2px rgba(255,215,0,0.4), inset 0 -1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(218,165,32,0.6)',
                  }}
                >
                  <span className="font-bold text-base" style={{ color: '#3a2800', textShadow: '0 1px 0 rgba(255,215,0,0.3)' }}>C</span>
                </div>
                <div className="absolute top-0 left-0 w-full h-full rounded-sm pointer-events-none" style={{
                  borderTop: '1px solid rgba(255,223,100,0.35)',
                  borderLeft: '1px solid rgba(255,223,100,0.2)',
                }} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-wide">
                  Constitutional Tender
                </h1>
                <p className="text-[10px] text-gold-400 tracking-[0.2em] uppercase">
                  Sovereign Web Terminal
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Desktop nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <Link href="/app/market" className="text-navy-300 hover:text-white transition-colors">
              Market
            </Link>
            <Link href="/app/orders" className="text-navy-300 hover:text-white transition-colors">
              Orders
            </Link>
            <Link href="/app/savings" className="text-navy-300 hover:text-white transition-colors">
              Savings
            </Link>
            <Link href="/app/profile" className="text-navy-300 hover:text-white transition-colors">
              Profile
            </Link>
          </nav>

          {/* Right: Cart + User */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="text-xs text-navy-500 hidden sm:inline">USD</span>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-navy-300 hover:text-white transition-colors"
              aria-label="Shopping cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center animate-pulse">
                <span className="text-xs text-navy-400">...</span>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-navy-400">{user.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                  <span className="text-xs text-navy-900 font-semibold">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    logout({
                      logoutParams: {
                        returnTo: typeof window !== 'undefined' ? window.location.origin : '',
                      },
                    })
                  }
                  className="hidden sm:block text-xs text-navy-400 hover:text-gold-400 transition-colors px-3 py-1 rounded-md hover:bg-navy-800"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
