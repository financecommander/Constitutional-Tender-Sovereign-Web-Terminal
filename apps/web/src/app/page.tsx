import { VaultSelector } from '@/components/VaultSelector';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-navy-600">
          Manage your allocated precious metals across international vaults.
        </p>
      </div>

      <VaultSelector />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Portfolio Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-navy-500 uppercase tracking-wider">
            Total Holdings
          </h2>
          <p className="mt-2 text-3xl font-bold text-navy-900">—</p>
          <p className="mt-1 text-sm text-navy-400">Across all vaults</p>
        </div>

        {/* Gold Position Card */}
        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-gold-600 uppercase tracking-wider">
            Gold Position
          </h2>
          <p className="mt-2 text-3xl font-bold text-navy-900">—</p>
          <p className="mt-1 text-sm text-navy-400">troy oz allocated</p>
        </div>

        {/* Silver Position Card */}
        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">
            Silver Position
          </h2>
          <p className="mt-2 text-3xl font-bold text-navy-900">—</p>
          <p className="mt-1 text-sm text-navy-400">troy oz allocated</p>
        </div>
      </div>

      {/* Recent Transactions Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
        <h2 className="text-lg font-semibold text-navy-800">
          Recent Transactions
        </h2>
        <p className="mt-4 text-navy-400 text-sm">
          No transactions yet. Use the trading panel to buy, sell, or teleport
          your precious metals.
        </p>
      </div>
    </div>
  );
}
