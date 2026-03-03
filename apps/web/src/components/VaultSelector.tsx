'use client';

import type { Vault } from '@/types/api';

const FLAG_MAP: Record<string, string> = {
  US: '\u{1F1FA}\u{1F1F8}',
  SG: '\u{1F1F8}\u{1F1EC}',
  CH: '\u{1F1E8}\u{1F1ED}',
  KY: '\u{1F1F0}\u{1F1FE}',
};

interface VaultSelectorProps {
  vaults: Vault[];
  selectedVaultId: string | null;
  onSelect: (vaultId: string | null) => void;
  isLoading: boolean;
}

export function VaultSelector({ vaults, selectedVaultId, onSelect, isLoading }: VaultSelectorProps) {
  if (isLoading) {
    return (
      <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">
          Select Vault
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-navy-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
      <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">
        Select Vault
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onSelect(null)}
          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors text-left ${
            selectedVaultId === null
              ? 'border-gold-500 bg-gold-500/10'
              : 'border-navy-600 hover:border-gold-500/50 hover:bg-navy-700/50'
          }`}
        >
          <span className="text-xl">*</span>
          <div>
            <p className="text-sm font-medium text-white">All Vaults</p>
            <p className="text-xs text-navy-400">Combined view</p>
          </div>
        </button>
        {vaults.map((vault) => (
          <button
            key={vault.id}
            onClick={() => onSelect(vault.id)}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors text-left ${
              selectedVaultId === vault.id
                ? 'border-gold-500 bg-gold-500/10'
                : 'border-navy-600 hover:border-gold-500/50 hover:bg-navy-700/50'
            }`}
          >
            <span className="text-xl">{FLAG_MAP[vault.country] || vault.country}</span>
            <div>
              <p className="text-sm font-medium text-white">{vault.name}</p>
              <p className="text-xs text-navy-400">{vault.location}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
