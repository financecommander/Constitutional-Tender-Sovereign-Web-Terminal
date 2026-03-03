'use client';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SpotTickerBar } from '@/components/SpotTickerBar';
import { useSpotStream } from '@/hooks/use-spot-stream';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { spots, status, connectionStatus } = useSpotStream();

  return (
    <div className="min-h-screen bg-navy-900">
      <Header />
      <SpotTickerBar
        spots={spots}
        connectionStatus={connectionStatus}
        lastUpdate={status?.lastUpdate || null}
      />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <ProtectedRoute>{children}</ProtectedRoute>
        </main>
      </div>
    </div>
  );
}
