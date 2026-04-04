'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/app', icon: '01' },
  { label: 'Market', href: '/app/market', icon: '02' },
  { label: 'Orders', href: '/app/orders', icon: '03' },
  { label: 'Savings Plans', href: '/app/savings', icon: '04' },
  { label: 'Learn', href: '/app/learn', icon: '05' },
  { label: 'Profile', href: '/app/profile', icon: '06' },
  { label: 'Settings', href: '/app/settings', icon: '07' },
  { label: 'Admin', href: '/app/admin', icon: '08' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:sticky lg:top-[108px] flex-col self-start w-64 mx-4 mt-6 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,20,33,0.92),rgba(7,15,26,0.76))] backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="px-5 pt-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gold-400/80">Workspace</p>
        <p className="mt-2 text-sm text-navy-300 leading-6">
          Premium market access, custody-aware inventory, and order-state visibility.
        </p>
      </div>

      <nav className="flex-1 py-5">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.label}>
              {(() => {
                const isActive = pathname === item.href;
                return (
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-3 rounded-2xl text-sm transition-all ${
                  isActive
                    ? 'bg-gold-500/10 text-white border border-gold-500/20'
                    : 'text-navy-300 border border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-bold ${
                  isActive ? 'bg-gold-500 text-navy-950' : 'bg-navy-800/90 text-navy-400'
                }`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
                );
              })()}
            </li>
          ))}
        </ul>
      </nav>

      <div className="m-4 rounded-2xl border border-white/8 bg-white/3 p-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-gold-400/80">Session Status</p>
        <p className="mt-2 text-sm font-semibold text-white">Verified market access</p>
        <div className="mt-3 text-xs text-navy-400">
          <p>Constitutional Tender</p>
          <p className="mt-1">v0.3.0</p>
        </div>
      </div>
    </aside>
  );
}
