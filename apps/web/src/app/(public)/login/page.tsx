'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

export default function LoginPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, loginWithRedirect]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-navy-400">Redirecting to login...</p>
      </div>
    </div>
  );
}
