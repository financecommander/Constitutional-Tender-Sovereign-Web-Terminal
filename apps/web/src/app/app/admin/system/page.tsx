'use client';

import { useState } from 'react';
import { useSystemHealth, overrideSpotPrice } from '@/hooks/use-admin';

export default function AdminSystemPage() {
  const { data: health, isLoading, error, refetch } = useSystemHealth();

  // Spot override form
  const [metal, setMetal] = useState('XAU');
  const [spotPrice, setSpotPrice] = useState('');
  const [changePct, setChangePct] = useState('0');
  const [overriding, setOverriding] = useState(false);
  const [overrideMsg, setOverrideMsg] = useState('');

  const handleOverride = async () => {
    if (!spotPrice) return;
    setOverriding(true);
    setOverrideMsg('');
    try {
      await overrideSpotPrice(metal, parseFloat(spotPrice), parseFloat(changePct));
      setOverrideMsg(`Updated ${metal} to $${spotPrice}`);
      setSpotPrice('');
    } catch (e) {
      setOverrideMsg(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setOverriding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Configuration</h1>
          <p className="mt-1 text-navy-400">Spot price overrides and system health.</p>
        </div>
        <button onClick={refetch} className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white text-sm rounded-lg transition-colors">
          Refresh
        </button>
      </div>

      {/* System Health */}
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">System Health</h2>
        {isLoading ? (
          <div className="animate-pulse h-20 bg-navy-700 rounded" />
        ) : error ? (
          <p className="text-red-400 text-sm">{error.message}</p>
        ) : health ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${health.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-white font-semibold text-lg uppercase">{health.status}</span>
              <span className="text-navy-400 text-xs ml-auto">{new Date(health.timestamp).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <HealthCard label="Database" status={health.checks.database.status} detail="PostgreSQL" />
              <HealthCard label="Spot Feed" status={health.checks.spotFeed.status} detail={`Last: ${new Date(health.checks.spotFeed.lastUpdate).toLocaleTimeString()}`} />
              <HealthCard label="Email" status={health.checks.email.provider} detail="Notification delivery" />
              <HealthCard label="KYC" status={health.checks.kyc.provider} detail="Identity verification" />
              <HealthCard label="Payments" status={health.checks.payments.stripe ? 'stripe' : 'demo'} detail="Payment processing" />
            </div>
          </div>
        ) : null}
      </div>

      {/* Spot Price Override */}
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Spot Price Override</h2>
        <p className="text-navy-400 text-sm mb-4">Manually set spot price for a metal. This overrides the live feed until the next automatic update.</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-navy-400 text-xs font-semibold mb-1">Metal</label>
            <select
              value={metal}
              onChange={(e) => setMetal(e.target.value)}
              className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="XAU">Gold (XAU)</option>
              <option value="XAG">Silver (XAG)</option>
            </select>
          </div>
          <div>
            <label className="block text-navy-400 text-xs font-semibold mb-1">Price (USD/oz)</label>
            <input
              type="number"
              value={spotPrice}
              onChange={(e) => setSpotPrice(e.target.value)}
              placeholder="e.g. 2920.50"
              step="0.01"
              className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm w-40 focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-navy-400 text-xs font-semibold mb-1">24h Change %</label>
            <input
              type="number"
              value={changePct}
              onChange={(e) => setChangePct(e.target.value)}
              step="0.01"
              className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm w-28 focus:outline-none focus:border-gold-500"
            />
          </div>
          <button
            onClick={handleOverride}
            disabled={!spotPrice || overriding}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-40 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {overriding ? 'Updating...' : 'Override Price'}
          </button>
        </div>
        {overrideMsg && (
          <p className={`mt-3 text-sm ${overrideMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {overrideMsg}
          </p>
        )}
      </div>

      {/* Integration Status */}
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Integration Configuration</h2>
        <div className="space-y-3">
          <IntegrationRow
            label="Live Spot Feed"
            envVar="METALS_API_KEY"
            providers={['metals-api.com', 'goldapi.io', 'metalpriceapi.com']}
            configured={false}
          />
          <IntegrationRow
            label="Payment Processing"
            envVar="STRIPE_SECRET_KEY"
            providers={['Stripe']}
            configured={false}
          />
          <IntegrationRow
            label="KYC Verification"
            envVar="KYC_API_KEY"
            providers={['Sumsub', 'Jumio', 'Persona', 'Onfido']}
            configured={false}
          />
          <IntegrationRow
            label="Email Notifications"
            envVar="EMAIL_API_KEY"
            providers={['SendGrid', 'Resend', 'SMTP']}
            configured={false}
          />
          <IntegrationRow
            label="Supplier Sync"
            envVar="SUPPLIER_API_KEYS"
            providers={['Custom API adapters']}
            configured={false}
          />
        </div>
      </div>
    </div>
  );
}

function HealthCard({ label, status, detail }: { label: string; status: string; detail: string }) {
  const isGood = ['up', 'live', 'stripe', 'sendgrid', 'resend'].includes(status);
  return (
    <div className="bg-navy-900 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${isGood ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span className="text-white text-sm font-semibold">{label}</span>
      </div>
      <div className="text-navy-400 text-xs">{status}</div>
      <div className="text-navy-500 text-xs mt-1">{detail}</div>
    </div>
  );
}

function IntegrationRow({ label, envVar, providers, configured }: { label: string; envVar: string; providers: string[]; configured: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded bg-navy-900">
      <div>
        <span className="text-white text-sm font-medium">{label}</span>
        <span className="text-navy-400 text-xs ml-2">{providers.join(', ')}</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-navy-500 text-xs">{envVar}</code>
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${configured ? 'bg-green-900/30 text-green-400' : 'bg-navy-700 text-navy-400'}`}>
          {configured ? 'Configured' : 'Demo Mode'}
        </span>
      </div>
    </div>
  );
}
