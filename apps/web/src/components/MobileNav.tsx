'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';

const navItems = [
  { label: 'Dashboard', href: '/app', icon: '◈' },
  { label: 'Market', href: '/app/market', icon: '◇' },
  { label: 'Orders', href: '/app/orders', icon: '☰' },
  { label: 'Profile', href: '/app/profile', icon: '⊕' },
  { label: 'Settings', href: '/app/settings', icon: '⚙' },
  { label: 'Savings Plans', href: '/app/savings', icon: '↻' },
  { label: 'Learn', href: '/app/learn', icon: '📖' },
  { label: 'Admin', href: '/app/admin', icon: '⊞' },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth0();

  return (
    <div className="lg:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-navy-300 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72 bg-navy-800 z-50 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-navy-700">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-6 flex items-center justify-center">
                  <div className="w-full h-full rounded-sm flex items-center justify-center" style={{
                    background: 'linear-gradient(145deg, #d4a438, #b8860b 30%, #daa520 50%, #b8860b 70%, #996515)',
                  }}>
                    <span className="font-bold text-sm" style={{ color: '#3a2800' }}>C</span>
                  </div>
                </div>
                <span className="text-white font-bold text-sm">Constitutional Tender</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-navy-400 hover:text-white text-xl">&times;</button>
            </div>

            {/* User info */}
            {user && (
              <div className="px-4 py-3 border-b border-navy-700">
                <p className="text-white text-sm font-medium">{user.name || user.email}</p>
                <p className="text-navy-400 text-xs">{user.email}</p>
              </div>
            )}

            {/* Nav items */}
            <nav className="flex-1 py-2 overflow-y-auto">
              <ul className="space-y-0.5 px-2">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm text-navy-300 hover:bg-navy-700/50 hover:text-white transition-colors"
                    >
                      <span className="text-base w-6 text-center">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-navy-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout({ logoutParams: { returnTo: typeof window !== 'undefined' ? window.location.origin : '' } });
                }}
                className="w-full text-left text-sm text-navy-400 hover:text-gold-400 transition-colors py-2"
              >
                Log Out
              </button>
              <p className="text-xs text-navy-600 mt-2">v0.3.0</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
