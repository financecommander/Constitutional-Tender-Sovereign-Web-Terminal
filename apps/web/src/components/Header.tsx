'use client';

import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';

export function Header() {
  const { logout, user, isAuthenticated, isLoading } = useAuth0();

  return (
    <header className="bg-navy-900 text-white border-b border-navy-700/50">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/app" className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
            <span className="text-navy-900 font-bold text-sm">CT</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">
              Constitutional Tender
            </h1>
            <p className="text-[10px] text-gold-400 tracking-[0.2em] uppercase">
              Sovereign Web Terminal
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <Link href="/app/market" className="text-navy-300 hover:text-white transition-colors">
            Market
          </Link>
          <Link href="/app/orders" className="text-navy-300 hover:text-white transition-colors">
            Orders
          </Link>
          <Link href="/app/profile" className="text-navy-300 hover:text-white transition-colors">
            Profile
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-navy-500">USD</span>

          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center animate-pulse">
              <span className="text-xs text-navy-400">...</span>
            </div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right">
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
                className="text-xs text-navy-400 hover:text-gold-400 transition-colors px-3 py-1 rounded-md hover:bg-navy-800"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
