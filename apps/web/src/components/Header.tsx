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
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[linear-gradient(180deg,rgba(10,19,31,0.94),rgba(7,15,26,0.88))] text-white backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          {/* Left: Mobile nav + Logo */}
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/app" className="flex items-center space-x-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/30 bg-[linear-gradient(180deg,#ddb86f,#9d742d)] shadow-[inset_0_1px_2px_rgba(255,215,0,0.4),0_6px_18px_rgba(0,0,0,0.28)]">
                <div className="flex h-full w-full items-center justify-center rounded-xl">
                  <span className="font-display text-lg font-bold text-[#241400]">C</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-2xl font-semibold tracking-wide">
                  Constitutional Tender
                </h1>
                <p className="text-[10px] text-gold-400/90 tracking-[0.28em] uppercase">
                  Sovereign Web Terminal
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Desktop nav */}
          <nav className="hidden md:flex items-center space-x-2 text-sm">
            <Link href="/app/market" className="rounded-full px-4 py-2 text-navy-300 hover:bg-white/5 hover:text-white transition-colors">
              Market
            </Link>
            <Link href="/app/orders" className="rounded-full px-4 py-2 text-navy-300 hover:bg-white/5 hover:text-white transition-colors">
              Orders
            </Link>
            <Link href="/app/savings" className="rounded-full px-4 py-2 text-navy-300 hover:bg-white/5 hover:text-white transition-colors">
              Savings
            </Link>
            <Link href="/app/profile" className="rounded-full px-4 py-2 text-navy-300 hover:bg-white/5 hover:text-white transition-colors">
              Profile
            </Link>
          </nav>

          {/* Right: Cart + User */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="hidden rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-navy-400 sm:inline">USD</span>

            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full border border-white/8 bg-white/5 p-2.5 text-navy-300 hover:text-white transition-colors"
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
                <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center">
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
                  className="hidden sm:block text-xs text-navy-400 hover:text-gold-400 transition-colors px-3 py-2 rounded-full hover:bg-white/5"
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
