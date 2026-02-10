export function Header() {
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
          <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
            <span className="text-xs text-navy-300">U</span>
          </div>
        </div>
      </div>
    </header>
  );
}
