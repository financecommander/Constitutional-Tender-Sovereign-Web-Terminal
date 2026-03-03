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

// --- v2 Types ---

export type Metal = 'XAU' | 'XAG' | 'XPT' | 'XPD';
export type ProductCategory = 'COIN' | 'BAR' | 'ROUND';
export type DeliveryType = 'DIRECT_SHIP' | 'VAULT_ALLOCATE';
export type PaymentRail = 'WIRE' | 'ACH' | 'CRYPTO';
export type OrderStatus =
  | 'PRICE_LOCKED'
  | 'FUNDS_CONFIRMED'
  | 'SUPPLIER_CONFIRMED'
  | 'SHIPMENT_CREATED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'VAULT_ALLOCATED'
  | 'CANCELLED';

export interface MetalSpot {
  metal: Metal;
  spotUsdPerOz: number;
  changePct24h: number;
  asOf: string;
  source: string;
}

export interface SpotStatus {
  lastUpdate: string;
  isStale: boolean;
  staleThresholdMs: number;
}

export interface SpotStreamEvent {
  type: 'spot.update' | 'system.status';
  payload: {
    spots?: MetalSpot[];
    status?: SpotStatus & { status?: string };
  };
}

export interface ProductSku {
  id: string;
  sku: string;
  metal: Metal;
  name: string;
  weightOz: string;
  purity: string;
  category: ProductCategory;
  images: string[];
  eligibleDeliveryTypes: DeliveryType[];
  flags: string[];
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  website: string | null;
  isActive: boolean;
}

export interface SupplierOffer {
  id: string;
  productSkuId: string;
  supplierId: string;
  availableQty: number;
  shipEtaDays: number;
  shipOrigin: string;
  premiumUsd: string;
  constraints: string[];
  isActive: boolean;
  productSku?: ProductSku;
  supplier?: Supplier;
}

export interface Quote {
  id: string;
  userId: string;
  productSkuId: string;
  offerId: string;
  quantity: number;
  lockedSpotUsd: string;
  lockedPremiumUsd: string;
  lockedSpreadUsd: string;
  lockedShippingUsd: string;
  totalUsd: string;
  deliveryType: DeliveryType;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
  productSku?: ProductSku;
  offer?: SupplierOffer;
}

export interface Order {
  id: string;
  quoteId: string;
  userId: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  paymentRail: PaymentRail;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  receiptSpotUsd: string;
  receiptPremiumUsd: string;
  receiptSpreadUsd: string;
  receiptShippingUsd: string;
  receiptTotalUsd: string;
  createdAt: string;
  updatedAt: string;
  quote?: Quote;
  events?: OrderEvent[];
}

export interface OrderEvent {
  id: string;
  orderId: string;
  stage: OrderStatus;
  note: string | null;
  createdAt: string;
}
