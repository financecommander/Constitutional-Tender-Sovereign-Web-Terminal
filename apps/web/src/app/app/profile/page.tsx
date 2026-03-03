'use client';

import { useProfile } from '@/hooks/use-profile';
import { KycBadge } from '@/components/KycBadge';

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
        <p className="mt-1 text-navy-400">Your account and KYC status.</p>
      </div>

      <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Account</h2>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-5 w-48 bg-navy-700 animate-pulse rounded" />
            <div className="h-5 w-64 bg-navy-700 animate-pulse rounded" />
          </div>
        ) : profile ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-400">Name</span>
              <span className="text-white">{profile.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Email</span>
              <span className="text-white">{profile.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-navy-400">KYC Status</span>
              <KycBadge status={profile.kycStatus} />
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">Base Currency</span>
              <span className="text-white">{profile.baseCurrency}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* KYC Action */}
      {profile && profile.kycStatus !== 'VERIFIED' && (
        <div className="bg-yellow-900/10 border border-yellow-800/30 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-yellow-400 mb-2">Identity Verification Required</h2>
          <p className="text-navy-400 text-sm mb-4">
            Complete KYC verification to unlock trading features. You can browse products and view pricing
            without verification, but placing orders requires a verified identity.
          </p>
          <button className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/30 transition-colors">
            Start Verification
          </button>
        </div>
      )}

      {profile?.permissions && profile.permissions.length > 0 && (
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-4">Permissions</h2>
          <div className="flex flex-wrap gap-2">
            {profile.permissions.map((perm) => (
              <span key={perm} className="px-3 py-1 rounded-full bg-navy-700 text-xs text-navy-300">
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
