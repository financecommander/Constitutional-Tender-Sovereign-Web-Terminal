'use client';

import { useAdminStats, useSystemHealth } from '@/hooks/use-admin';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  PRICE_LOCKED: 'bg-blue-500',
  FUNDS_CONFIRMED: 'bg-yellow-500',
  SUPPLIER_CONFIRMED: 'bg-purple-500',
  SHIPMENT_CREATED: 'bg-indigo-500',
  IN_TRANSIT: 'bg-orange-500',
  DELIVERED: 'bg-green-500',
  VAULT_ALLOCATED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
};

export default function AdminDashboard() {
  const { data: stats, isLoading, error, refetch } = useAdminStats();
  const { data: health } = useSystemHealth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-navy-400">System overview and management.</p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white text-sm rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-navy-800 border border-navy-700 rounded-lg p-6 animate-pulse h-28" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          {error.message}
        </div>
      ) : stats ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Total Users" value={stats.overview.totalUsers} icon="U" />
            <StatCard label="Total Orders" value={stats.overview.totalOrders} icon="O" />
            <StatCard label="Active Products" value={stats.overview.activeProducts} icon="P" />
            <StatCard label="Active Suppliers" value={stats.overview.activeSuppliers} icon="S" />
            <StatCard
              label="Total Revenue"
              value={`$${stats.overview.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon="$"
              highlight
            />
          </div>

          {/* System Health */}
          {health && (
            <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">System Health</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <HealthCheck label="Database" status={health.checks.database.status} />
                <HealthCheck label="Spot Feed" status={health.checks.spotFeed.status} />
                <HealthCheck label="Email" status={health.checks.email.provider} />
                <HealthCheck label="KYC" status={health.checks.kyc.provider} />
                <HealthCheck label="Payments" status={health.checks.payments.stripe ? 'configured' : 'demo'} />
              </div>
            </div>
          )}

          {/* Orders by Status */}
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Orders by Status</h2>
              <Link href="/app/admin/orders" className="text-gold-400 hover:text-gold-300 text-sm">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status] || 'bg-navy-500'}`} />
                  <span className="text-navy-300 text-sm">{status.replace(/_/g, ' ')}</span>
                  <span className="text-white font-semibold text-sm ml-auto">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
            <div className="space-y-2">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/app/admin/orders"
                  className="flex items-center justify-between py-2 px-3 rounded hover:bg-navy-700/50 transition-colors"
                >
                  <div>
                    <span className="text-white text-sm font-medium">{order.product}</span>
                    <span className="text-navy-400 text-xs ml-2">{order.user}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-semibold">
                      ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[order.status] || 'bg-navy-500'}`} />
                  </div>
                </Link>
              ))}
              {stats.recentOrders.length === 0 && (
                <p className="text-navy-400 text-sm text-center py-4">No orders yet.</p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickLink href="/app/admin/orders" label="Manage Orders" desc="View, advance status" />
            <QuickLink href="/app/admin/users" label="Manage Users" desc="View, KYC overrides" />
            <QuickLink href="/app/admin/system" label="System Config" desc="Spot overrides, health" />
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string | number; icon: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-5 border ${highlight ? 'bg-gold-500/10 border-gold-500/30' : 'bg-navy-800 border-navy-700'}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wide ${highlight ? 'text-gold-400' : 'text-navy-400'}`}>
          {label}
        </span>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${highlight ? 'bg-gold-500/20 text-gold-400' : 'bg-navy-700 text-navy-400'}`}>
          {icon}
        </span>
      </div>
      <div className={`mt-2 text-2xl font-bold ${highlight ? 'text-gold-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function HealthCheck({ label, status }: { label: string; status: string }) {
  const isGood = ['up', 'live', 'configured'].includes(status);
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${isGood ? 'bg-green-500' : 'bg-yellow-500'}`} />
      <div>
        <div className="text-white text-sm font-medium">{label}</div>
        <div className="text-navy-400 text-xs">{status}</div>
      </div>
    </div>
  );
}

function QuickLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="bg-navy-800 border border-navy-700 rounded-lg p-5 hover:border-gold-500/30 transition-colors group"
    >
      <h3 className="text-white font-semibold group-hover:text-gold-400 transition-colors">{label}</h3>
      <p className="text-navy-400 text-sm mt-1">{desc}</p>
    </Link>
  );
}
