'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface SavingsPlan {
  id: string;
  product: { sku: string; name: string; metal: string };
  amountUsd: number;
  frequency: string;
  frequencyDays: number;
  deliveryType: string;
  paymentRail: string;
  isActive: boolean;
  nextRunAt: string;
  totalInvested: number;
  totalOzBought: number;
  executionCount: number;
  createdAt: string;
}

const METAL_COLORS: Record<string, string> = {
  XAU: 'text-gold-400',
  XAG: 'text-navy-300',
  XPT: 'text-blue-400',
  XPD: 'text-emerald-400',
};

export default function SavingsPage() {
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    sku: '',
    amountUsd: 100,
    frequencyDays: 30,
    deliveryType: 'DIRECT_SHIP',
    paymentRail: 'WIRE',
  });

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/savings`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const togglePlan = async (planId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/savings/${planId}/toggle`, {
        method: 'PATCH',
        credentials: 'include',
      });
      fetchPlans();
    } catch {
      // ignore
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Delete this savings plan? This cannot be undone.')) return;
    try {
      await fetch(`${API_BASE_URL}/api/savings/${planId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchPlans();
    } catch {
      // ignore
    }
  };

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/savings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        fetchPlans();
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const totalInvested = plans.reduce((sum, p) => sum + p.totalInvested, 0);
  const totalOz = plans.reduce((sum, p) => sum + p.totalOzBought, 0);
  const activePlans = plans.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Savings Plans</h1>
          <p className="mt-1 text-navy-400">Dollar-cost average into precious metals automatically.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold text-sm rounded-lg transition-colors"
        >
          {showCreate ? 'Cancel' : '+ New Plan'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
          <p className="text-navy-400 text-xs uppercase tracking-wider">Active Plans</p>
          <p className="text-2xl font-bold text-white mt-1">{activePlans}</p>
        </div>
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
          <p className="text-navy-400 text-xs uppercase tracking-wider">Total Invested</p>
          <p className="text-2xl font-bold text-gold-400 mt-1">
            ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
          <p className="text-navy-400 text-xs uppercase tracking-wider">Total Ounces Bought</p>
          <p className="text-2xl font-bold text-white mt-1">{totalOz.toFixed(4)} oz</p>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-navy-800 border border-gold-500/30 rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Create New Savings Plan</h2>
          <form onSubmit={createPlan} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-navy-400 mb-1">Product SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. AGE-1OZ"
                className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-navy-400 mb-1">Amount (USD)</label>
              <input
                type="number"
                min={50}
                value={form.amountUsd}
                onChange={(e) => setForm({ ...form, amountUsd: Number(e.target.value) })}
                className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none"
                required
              />
              <p className="text-xs text-navy-500 mt-1">Minimum $50</p>
            </div>
            <div>
              <label className="block text-xs text-navy-400 mb-1">Frequency</label>
              <select
                value={form.frequencyDays}
                onChange={(e) => setForm({ ...form, frequencyDays: Number(e.target.value) })}
                className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none"
              >
                <option value={7}>Weekly</option>
                <option value={14}>Bi-weekly</option>
                <option value={30}>Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-navy-400 mb-1">Payment Method</label>
              <select
                value={form.paymentRail}
                onChange={(e) => setForm({ ...form, paymentRail: e.target.value })}
                className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none"
              >
                <option value="WIRE">Wire Transfer (4% discount)</option>
                <option value="ACH">ACH (4% discount)</option>
                <option value="CRYPTO">Crypto</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plans List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-navy-800 border border-navy-700 rounded-lg p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-12 text-center">
          <div className="text-4xl mb-3">↻</div>
          <h3 className="text-white font-semibold text-lg mb-2">No Savings Plans Yet</h3>
          <p className="text-navy-400 text-sm mb-4">
            Start dollar-cost averaging into gold, silver, platinum, or palladium.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold text-sm rounded-lg transition-colors"
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-navy-800 border border-navy-700 rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-2xl ${plan.isActive ? 'opacity-100' : 'opacity-40'}`}>↻</div>
                  <div>
                    <Link
                      href={`/app/product/${plan.product.sku}`}
                      className={`font-semibold hover:text-gold-400 transition-colors ${METAL_COLORS[plan.product.metal] || 'text-white'}`}
                    >
                      {plan.product.name}
                    </Link>
                    <p className="text-navy-400 text-xs mt-0.5">
                      ${plan.amountUsd.toLocaleString()} &middot; {plan.frequency} &middot; {plan.paymentRail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    plan.isActive
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-navy-700 text-navy-400'
                  }`}>
                    {plan.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div>
                  <p className="text-xs text-navy-500">Total Invested</p>
                  <p className="text-sm text-white font-medium">
                    ${plan.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Ounces Bought</p>
                  <p className="text-sm text-white font-medium">{plan.totalOzBought.toFixed(4)} oz</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Executions</p>
                  <p className="text-sm text-white font-medium">{plan.executionCount}</p>
                </div>
                <div>
                  <p className="text-xs text-navy-500">Next Run</p>
                  <p className="text-sm text-white font-medium">
                    {plan.isActive ? new Date(plan.nextRunAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-navy-700">
                <button
                  onClick={() => togglePlan(plan.id)}
                  className="text-xs text-navy-400 hover:text-white transition-colors px-3 py-1 rounded bg-navy-700 hover:bg-navy-600"
                >
                  {plan.isActive ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded bg-navy-700 hover:bg-navy-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-navy-800/50 border border-navy-700/50 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3">How DCA Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-navy-400">
          <div>
            <p className="text-gold-400 font-medium mb-1">1. Choose a Product</p>
            <p>Pick a gold, silver, platinum, or palladium product you want to accumulate over time.</p>
          </div>
          <div>
            <p className="text-gold-400 font-medium mb-1">2. Set Your Budget</p>
            <p>Decide how much to invest and how often (weekly, bi-weekly, or monthly). Min $50.</p>
          </div>
          <div>
            <p className="text-gold-400 font-medium mb-1">3. Automatic Purchases</p>
            <p>We buy at the best available price on each schedule. You smooth out market volatility.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
