'use client';

import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';

const navLinks = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Security', href: '/security' },
  { label: 'FAQ', href: '/faq' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="border-b border-navy-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center space-x-3">
            {/* Gold brick logo with "C" */}
            <div className="relative w-10 h-8 flex items-center justify-center">
              <div
                className="w-full h-full rounded-sm flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #d4a438, #b8860b 30%, #daa520 50%, #b8860b 70%, #996515)',
                  boxShadow: 'inset 0 1px 2px rgba(255,215,0,0.4), inset 0 -1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(218,165,32,0.6)',
                }}
              >
                <span className="font-bold text-lg" style={{ color: '#3a2800', textShadow: '0 1px 0 rgba(255,215,0,0.3)' }}>C</span>
              </div>
              <div className="absolute top-0 left-0 w-full h-full rounded-sm pointer-events-none" style={{
                borderTop: '1px solid rgba(255,223,100,0.35)',
                borderLeft: '1px solid rgba(255,223,100,0.2)',
              }} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">
                Constitutional Tender
              </h1>
              <p className="text-[10px] text-gold-400 tracking-[0.2em] uppercase">
                Lawful Money
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-navy-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="text-sm bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-5 py-2 rounded-md transition-colors"
              >
                Enter Platform
              </Link>
            ) : (
              <>
                <button
                  onClick={() => loginWithRedirect()}
                  className="text-sm text-navy-300 hover:text-white transition-colors px-4 py-2"
                >
                  Log In
                </button>
                <button
                  onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
                  className="text-sm bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-5 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-navy-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-navy-500">
              Constitutional Tender LLC. All rights reserved.
            </p>
            <div className="flex space-x-6 text-xs text-navy-500">
              <Link href="/legal/terms" className="hover:text-navy-300 transition-colors">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-navy-300 transition-colors">Privacy</Link>
              <Link href="/legal/risk-disclosures" className="hover:text-navy-300 transition-colors">Risk Disclosures</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
