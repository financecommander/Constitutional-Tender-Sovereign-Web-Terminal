'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useApi } from '@/hooks/use-api';

export default function SettingsPage() {
  const { data: profile, isLoading, error, refetch } = useProfile();
  const api = useApi();

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleVerifyKyc() {
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      await api.post('/auth/verify-kyc', {});
      setVerifyResult({ success: true, message: 'KYC verification completed successfully.' });
      refetch();
    } catch (err) {
      setVerifyResult({
        success: false,
        message: err instanceof Error ? err.message : 'Verification failed. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Settings</h1>
        <p className="mt-1 text-navy-600">Account details and preferences.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 flex items-center justify-between">
          <span>Failed to load profile.</span>
          <button onClick={refetch} className="underline font-medium">Retry</button>
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-4">Profile</h2>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 w-48 bg-navy-100 animate-pulse rounded" />
              ))}
            </div>
          ) : profile ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Full Name</label>
                <p className="mt-0.5 text-sm text-navy-800">{profile.fullName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Email</label>
                <p className="mt-0.5 text-sm text-navy-800">{profile.email}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Base Currency</label>
                <p className="mt-0.5 text-sm text-navy-800">{profile.baseCurrency}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-4">KYC Verification</h2>
          {isLoading ? (
            <div className="h-6 w-32 bg-navy-100 animate-pulse rounded" />
          ) : profile ? (
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-navy-600">Status:</span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    profile.kycStatus === 'VERIFIED'
                      ? 'bg-green-100 text-green-800'
                      : profile.kycStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {profile.kycStatus}
                </span>
              </div>

              {profile.kycStatus === 'PENDING' && (
                <div className="mt-4">
                  <button
                    onClick={handleVerifyKyc}
                    disabled={isVerifying}
                    className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify KYC'}
                  </button>
                </div>
              )}

              {profile.kycStatus === 'VERIFIED' && (
                <p className="mt-2 text-sm text-green-700">
                  Your identity has been verified. Full trading access is enabled.
                </p>
              )}

              {verifyResult && (
                <div
                  className={`mt-3 p-3 rounded-lg text-sm ${
                    verifyResult.success
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {verifyResult.message}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-navy-100 p-6">
          <h2 className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-4">Permissions</h2>
          {isLoading ? (
            <div className="h-6 w-48 bg-navy-100 animate-pulse rounded" />
          ) : profile?.permissions?.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.permissions.map((perm) => (
                <span
                  key={perm}
                  className="text-xs font-medium bg-navy-100 text-navy-700 px-2 py-1 rounded"
                >
                  {perm}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-400">No special permissions assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
}
