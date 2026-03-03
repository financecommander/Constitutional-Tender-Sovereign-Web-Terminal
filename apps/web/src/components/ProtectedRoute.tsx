'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-navy-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-sm text-navy-400 mb-4">
            Please log in to access this page.
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-6 py-2 rounded-md transition-colors text-sm"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
