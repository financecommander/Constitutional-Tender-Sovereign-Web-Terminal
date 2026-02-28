import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransactionRow } from '../TransactionRow';
import type { Transaction } from '@/types/api';

const baseTransaction: Transaction = {
  id: 'tx-1',
  userId: 'user-1',
  assetId: 'asset-1',
  type: 'BUY',
  status: 'COMPLETED',
  quantity: '2.5000',
  pricePerUnit: '2680.00',
  totalAmount: '6700.00',
  currency: 'USD',
  fromVaultId: null,
  toVaultId: 'vault-1',
  fxRate: null,
  notes: null,
  createdAt: '2025-06-15T12:00:00.000Z',
  updatedAt: '2025-06-15T12:00:00.000Z',
  asset: {
    id: 'asset-1',
    name: '1oz Gold Bar',
    symbol: 'XAU-1OZ',
    metalType: 'GOLD',
    weightOz: '1',
    livePriceBid: '2650.00',
    livePriceAsk: '2680.00',
    spreadPercent: '1.13',
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-06-15T00:00:00.000Z',
  },
  fromVault: null,
  toVault: {
    id: 'vault-1',
    name: 'Zurich Free Port',
    location: 'Zurich',
    country: 'CH',
    regulatoryJurisdiction: 'FINMA',
    supportedAssets: ['GOLD', 'SILVER'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
};

describe('TransactionRow', () => {
  it('renders asset name and quantity', () => {
    render(<TransactionRow transaction={baseTransaction} />);

    expect(screen.getByText('1oz Gold Bar')).toBeInTheDocument();
    expect(screen.getByText('2.5000 units')).toBeInTheDocument();
  });

  it('renders formatted currency amount for BUY', () => {
    render(<TransactionRow transaction={baseTransaction} />);

    // $6,700.00
    expect(screen.getByText('$6,700.00')).toBeInTheDocument();
  });

  it('renders type badge with correct text', () => {
    render(<TransactionRow transaction={baseTransaction} />);

    const badge = screen.getByText('BUY');
    expect(badge).toBeInTheDocument();
  });

  it('renders SELL type badge', () => {
    const sellTx: Transaction = { ...baseTransaction, type: 'SELL' };
    render(<TransactionRow transaction={sellTx} />);

    expect(screen.getByText('SELL')).toBeInTheDocument();
  });

  it('renders TELEPORT type with dash for zero amount', () => {
    const teleportTx: Transaction = {
      ...baseTransaction,
      type: 'TELEPORT',
      totalAmount: '0',
      pricePerUnit: '0',
    };
    render(<TransactionRow transaction={teleportTx} />);

    expect(screen.getByText('TELEPORT')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<TransactionRow transaction={baseTransaction} />);

    // Jun 15, 2025
    expect(screen.getByText('Jun 15, 2025')).toBeInTheDocument();
  });
});
