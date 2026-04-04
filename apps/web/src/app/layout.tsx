import type { Metadata } from 'next';
import './globals.css';
import { Auth0ProviderWrapper } from '@/providers/auth0-provider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Constitutional Tender | Lawful Money. Modern Execution.',
  description:
    'Live pricing, transparent spreads, and auditable receipts for gold and silver ownership.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navy-900 text-navy-100">
        <ErrorBoundary>
          <Auth0ProviderWrapper>
            {children}
          </Auth0ProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
