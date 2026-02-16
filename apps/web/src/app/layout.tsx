import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Auth0ProviderWrapper } from '@/providers/auth0-provider';

export const metadata: Metadata = {
  title: 'Constitutional Tender | Sovereign Web Terminal',
  description:
    'Institutional-grade trading terminal for allocated gold and silver across international vaults.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navy-50">
        <Auth0ProviderWrapper>
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </Auth0ProviderWrapper>
      </body>
    </html>
  );
}
