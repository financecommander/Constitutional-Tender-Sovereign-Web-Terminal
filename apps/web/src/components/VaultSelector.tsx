const vaults = [
  { id: 'tx', name: 'Texas Depository', location: 'Austin, TX', flag: '🇺🇸' },
  { id: 'wy', name: 'Wyoming Vault', location: 'Cheyenne, WY', flag: '🇺🇸' },
  { id: 'sg', name: 'Singapore Freeport', location: 'Singapore', flag: '🇸🇬' },
  { id: 'zh', name: 'Zurich Vault', location: 'Zurich, CH', flag: '🇨🇭' },
  { id: 'ky', name: 'Cayman Vault', location: 'Grand Cayman, KY', flag: '🇰🇾' },
];

export function VaultSelector() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
      <h2 className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-4">
        Select Vault
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {vaults.map((vault) => (
          <button
            key={vault.id}
            className="flex items-center space-x-3 p-3 rounded-lg border border-navy-200 hover:border-gold-400 hover:bg-gold-50 transition-colors text-left"
          >
            <span className="text-xl">{vault.flag}</span>
            <div>
              <p className="text-sm font-medium text-navy-800">{vault.name}</p>
              <p className="text-xs text-navy-400">{vault.location}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
