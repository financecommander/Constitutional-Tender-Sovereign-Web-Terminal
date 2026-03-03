'use client';

import { useState } from 'react';
import { useAdminUsers, setUserKycStatus } from '@/hooks/use-admin';

const KYC_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-900/30 text-yellow-400',
  VERIFIED: 'bg-green-900/30 text-green-400',
  REJECTED: 'bg-red-900/30 text-red-400',
};

export default function AdminUsersPage() {
  const { data: users, isLoading, error, refetch } = useAdminUsers();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleKycUpdate = async (userId: string, status: string) => {
    setUpdating(userId);
    try {
      await setUserKycStatus(userId, status);
      refetch();
    } catch (e) {
      alert(`Failed: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="mt-1 text-navy-400">View users and manage KYC status.</p>
        </div>
        <button onClick={refetch} className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white text-sm rounded-lg transition-colors">
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-navy-800 border border-navy-700 rounded-lg p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          {error.message}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-8 text-center">
          <p className="text-navy-400 text-sm">No users found.</p>
        </div>
      ) : (
        <div className="bg-navy-800 border border-navy-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-900">
              <tr>
                <th className="text-left px-4 py-3 text-navy-400 font-semibold text-xs uppercase">User</th>
                <th className="text-left px-4 py-3 text-navy-400 font-semibold text-xs uppercase">KYC Status</th>
                <th className="text-left px-4 py-3 text-navy-400 font-semibold text-xs uppercase">Orders</th>
                <th className="text-left px-4 py-3 text-navy-400 font-semibold text-xs uppercase">Joined</th>
                <th className="text-right px-4 py-3 text-navy-400 font-semibold text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-navy-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{user.fullName || 'N/A'}</div>
                    <div className="text-navy-400 text-xs">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${KYC_STYLES[user.kycStatus] || ''}`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy-300">{user.orderCount}</td>
                  <td className="px-4 py-3 text-navy-300 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.kycStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => handleKycUpdate(user.id, 'VERIFIED')}
                          disabled={updating === user.id}
                          className="px-2 py-1 bg-green-900/30 text-green-400 hover:bg-green-900/50 rounded text-xs font-semibold transition-colors disabled:opacity-40"
                        >
                          Verify
                        </button>
                      )}
                      {user.kycStatus !== 'REJECTED' && (
                        <button
                          onClick={() => handleKycUpdate(user.id, 'REJECTED')}
                          disabled={updating === user.id}
                          className="px-2 py-1 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded text-xs font-semibold transition-colors disabled:opacity-40"
                        >
                          Reject
                        </button>
                      )}
                      {user.kycStatus !== 'PENDING' && (
                        <button
                          onClick={() => handleKycUpdate(user.id, 'PENDING')}
                          disabled={updating === user.id}
                          className="px-2 py-1 bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50 rounded text-xs font-semibold transition-colors disabled:opacity-40"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
