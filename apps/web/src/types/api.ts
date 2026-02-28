export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type Currency = 'USD' | 'EUR' | 'CHF' | 'SGD' | 'KYD' | 'GBP';
export type TransactionType = 'BUY' | 'SELL' | 'TELEPORT' | 'WITHDRAWAL';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface User {
  id: string;
  authId: string;
  email: string;
  fullName: string;
  kycStatus: KycStatus;
  baseCurrency: Currency;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
}

export interface Vault {
  id: string;
  name: string;
  location: string;
  country: string;
  regulatoryJurisdiction: string;
  supportedAssets: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  metalType: string;
  weightOz: string;
  livePriceBid: string;
  livePriceAsk: string;
  spreadPercent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Holding {
  id: string;
  userId: string;
  assetId: string;
  vaultId: string;
  quantity: string;
  createdAt: string;
  updatedAt: string;
  asset: Asset;
  vault: Vault;
}

export interface Transaction {
  id: string;
  userId: string;
  assetId: string;
  type: TransactionType;
  status: TransactionStatus;
  quantity: string;
  pricePerUnit: string;
  totalAmount: string;
  currency: Currency;
  fromVaultId: string | null;
  toVaultId: string | null;
  fxRate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  asset: Asset;
  fromVault: Vault | null;
  toVault: Vault | null;
}

export interface AssetPrice {
  id: string;
  name: string;
  symbol: string;
  metalType: string;
  weightOz: string;
  livePriceBid: string;
  livePriceAsk: string;
  spreadPercent: string;
}

export interface FxRates {
  baseCurrency: string;
  rates: Record<string, number>;
  updatedAt: string;
}

export interface CreateTradeRequest {
  assetId: string;
  vaultId: string;
  quantity: number;
  currency: Currency;
}

export interface CreateTeleportRequest {
  assetId: string;
  fromVaultId: string;
  toVaultId: string;
  quantity: number;
}
