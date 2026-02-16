'use client';

import { useAuth0 } from '@auth0/auth0-react';

export function Header() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  return (
    <header className="bg-navy-900 text-white border-b border-gold-500/30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
            <span className="text-navy-900 font-bold text-sm">CT</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">
              Constitutional Tender
            </h1>
            <p className="text-xs text-gold-300 tracking-widest uppercase">
              Sovereign Web Terminal
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <span className="text-navy-300 hover:text-white cursor-pointer transition-colors">
            Markets
          </span>
          <span className="text-navy-300 hover:text-white cursor-pointer transition-colors">
            Trade
          </span>
          <span className="text-navy-300 hover:text-white cursor-pointer transition-colors">
            Vaults
          </span>
          <span className="text-navy-300 hover:text-white cursor-pointer transition-colors">
            History
          </span>
        </nav>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-navy-400">USD</span>
          
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center animate-pulse">
              <span className="text-xs text-navy-300">...</span>
            </div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs text-navy-300">{user.email}</p>
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
                className="text-xs text-navy-300 hover:text-gold-400 transition-colors px-3 py-1 rounded-md hover:bg-navy-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="text-sm bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

