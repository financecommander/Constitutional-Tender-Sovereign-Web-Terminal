const navItems = [
  { label: 'Dashboard', href: '/', icon: '◈' },
  { label: 'Portfolio', href: '/portfolio', icon: '◇' },
  { label: 'Trade', href: '/trade', icon: '⬡' },
  { label: 'Teleport', href: '/teleport', icon: '⇄' },
  { label: 'Transactions', href: '/transactions', icon: '☰' },
  { label: 'Settings', href: '/settings', icon: '⚙' },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-navy-100 min-h-[calc(100vh-72px)]">
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-navy-700 hover:bg-navy-50 hover:text-navy-900 transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-navy-100">
        <div className="text-xs text-navy-400">
          <p>Phase 1 MVP</p>
          <p className="mt-1">v0.1.0</p>
        </div>
      </div>
    </aside>
  );
}
