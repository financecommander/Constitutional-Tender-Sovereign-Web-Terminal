'use client';

import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', href: '/app', icon: '◈' },
  { label: 'Market', href: '/app/market', icon: '◇' },
  { label: 'Orders', href: '/app/orders', icon: '☰' },
  { label: 'Profile', href: '/app/profile', icon: '⊕' },
  { label: 'Settings', href: '/app/settings', icon: '⚙' },
  { label: 'Admin', href: '/app/admin', icon: '⊞' },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-navy-800/50 border-r border-navy-700/50 min-h-[calc(100vh-72px)]">
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-navy-300 hover:bg-navy-700/50 hover:text-white transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-navy-700/50">
        <div className="text-xs text-navy-500">
          <p>Constitutional Tender</p>
          <p className="mt-1">v0.2.0</p>
        </div>
      </div>
    </aside>
  );
}
