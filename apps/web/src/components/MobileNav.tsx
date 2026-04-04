'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/app', icon: '01' },
  { label: 'Market', href: '/app/market', icon: '02' },
  { label: 'Orders', href: '/app/orders', icon: '03' },
  { label: 'Profile', href: '/app/profile', icon: '04' },
  { label: 'Settings', href: '/app/settings', icon: '05' },
  { label: 'Savings Plans', href: '/app/savings', icon: '06' },
  { label: 'Learn', href: '/app/learn', icon: '07' },
  { label: 'Admin', href: '/app/admin', icon: '08' },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth0();
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full border border-white/8 bg-white/5 p-2 text-navy-300 hover:text-white transition-colors"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 max-w-[92vw] z-50 shadow-2xl flex flex-col border-r border-white/8 bg-[linear-gradient(180deg,rgba(10,20,33,0.98),rgba(7,15,26,0.96))]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/30 bg-[linear-gradient(180deg,#ddb86f,#9d742d)]">
                  <span className="font-display text-lg font-bold text-[#241400]">C</span>
                </div>
                <div>
                  <span className="font-display text-white text-xl leading-none">Constitutional Tender</span>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-gold-400/90">Sovereign web terminal</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-navy-400 hover:text-white text-xl">&times;</button>
            </div>

            {/* User info */}
            {user && (
              <div className="mx-4 mt-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                <p className="text-white text-sm font-medium">{user.name || user.email}</p>
                <p className="text-navy-400 text-xs mt-1">{user.email}</p>
              </div>
            )}

            {/* Nav items */}
            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="space-y-1 px-3">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-2xl text-sm transition-colors ${
                        pathname === item.href
                          ? 'border border-gold-500/20 bg-gold-500/10 text-white'
                          : 'text-navy-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-bold ${
                        pathname === item.href ? 'bg-gold-500 text-navy-950' : 'bg-navy-800 text-navy-400'
                      }`}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/8">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout({ logoutParams: { returnTo: typeof window !== 'undefined' ? window.location.origin : '' } });
                }}
                className="w-full rounded-full border border-white/8 bg-white/5 px-4 py-3 text-left text-sm text-navy-300 hover:text-gold-400 transition-colors"
              >
                Log Out
              </button>
              <p className="text-xs text-navy-600 mt-3">v0.3.0</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
