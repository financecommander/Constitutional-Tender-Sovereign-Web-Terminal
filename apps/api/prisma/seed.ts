import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Vaults ---
  const vaults = await Promise.all([
    prisma.vault.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Texas Depository',
        location: 'Austin, TX',
        country: 'US',
        regulatoryJurisdiction: 'United States',
        supportedAssets: ['GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM'],
      },
    }),
    prisma.vault.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Wyoming Vault',
        location: 'Cheyenne, WY',
        country: 'US',
        regulatoryJurisdiction: 'United States',
        supportedAssets: ['GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM'],
      },
    }),
    prisma.vault.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Singapore Freeport',
        location: 'Singapore',
        country: 'SG',
        regulatoryJurisdiction: 'Singapore',
        supportedAssets: ['GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM'],
      },
    }),
    prisma.vault.upsert({
      where: { id: '00000000-0000-0000-0000-000000000004' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'Zurich Vault',
        location: 'Zurich',
        country: 'CH',
        regulatoryJurisdiction: 'Switzerland',
        supportedAssets: ['GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM'],
      },
    }),
    prisma.vault.upsert({
      where: { id: '00000000-0000-0000-0000-000000000005' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000005',
        name: 'Cayman Vault',
        location: 'Grand Cayman',
        country: 'KY',
        regulatoryJurisdiction: 'Cayman Islands',
        supportedAssets: ['GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM'],
      },
    }),
  ]);
  console.log(`  Created ${vaults.length} vaults`);

  // --- Assets (precious metals with realistic prices) ---
  const assets = await Promise.all([
    prisma.asset.upsert({
      where: { symbol: 'XAU-1OZ' },
      update: { livePriceBid: 2648.50, livePriceAsk: 2653.80, spreadPercent: 0.20 },
      create: { name: 'Gold 1 oz', symbol: 'XAU-1OZ', metalType: 'GOLD', weightOz: 1, livePriceBid: 2648.50, livePriceAsk: 2653.80, spreadPercent: 0.20 },
    }),
    prisma.asset.upsert({
      where: { symbol: 'XAU-10OZ' },
      update: { livePriceBid: 26485.00, livePriceAsk: 26538.00, spreadPercent: 0.20 },
      create: { name: 'Gold 10 oz Bar', symbol: 'XAU-10OZ', metalType: 'GOLD', weightOz: 10, livePriceBid: 26485.00, livePriceAsk: 26538.00, spreadPercent: 0.20 },
    }),
    prisma.asset.upsert({
      where: { symbol: 'XAG-1OZ' },
      update: { livePriceBid: 31.05, livePriceAsk: 31.25, spreadPercent: 0.64 },
      create: { name: 'Silver 1 oz', symbol: 'XAG-1OZ', metalType: 'SILVER', weightOz: 1, livePriceBid: 31.05, livePriceAsk: 31.25, spreadPercent: 0.64 },
    }),
    prisma.asset.upsert({
      where: { symbol: 'XAG-100OZ' },
      update: { livePriceBid: 3105.00, livePriceAsk: 3125.00, spreadPercent: 0.64 },
      create: { name: 'Silver 100 oz Bar', symbol: 'XAG-100OZ', metalType: 'SILVER', weightOz: 100, livePriceBid: 3105.00, livePriceAsk: 3125.00, spreadPercent: 0.64 },
    }),
    prisma.asset.upsert({
      where: { symbol: 'XPT-1OZ' },
      update: { livePriceBid: 962.00, livePriceAsk: 972.00, spreadPercent: 1.04 },
      create: { name: 'Platinum 1 oz', symbol: 'XPT-1OZ', metalType: 'PLATINUM', weightOz: 1, livePriceBid: 962.00, livePriceAsk: 972.00, spreadPercent: 1.04 },
    }),
    prisma.asset.upsert({
      where: { symbol: 'XPD-1OZ' },
      update: { livePriceBid: 952.00, livePriceAsk: 965.00, spreadPercent: 1.36 },
      create: { name: 'Palladium 1 oz', symbol: 'XPD-1OZ', metalType: 'PALLADIUM', weightOz: 1, livePriceBid: 952.00, livePriceAsk: 965.00, spreadPercent: 1.36 },
    }),
  ]);
  console.log(`  Created ${assets.length} assets`);

  // --- Suppliers ---
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: '00000000-0000-0000-0000-000000000101' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000101',
        name: 'Dillon Gage Metals',
        contact: 'trading@dillongage.com',
        website: 'https://dillongage.com',
      },
    }),
    prisma.supplier.upsert({
      where: { id: '00000000-0000-0000-0000-000000000102' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000102',
        name: 'Upstate Coin & Gold',
        contact: 'wholesale@upstatecoins.com',
        website: 'https://platform.gold',
      },
    }),
    prisma.supplier.upsert({
      where: { id: '00000000-0000-0000-0000-000000000103' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000103',
        name: 'A-Mark Precious Metals',
        contact: 'trading@amark.com',
        website: 'https://amark.com',
      },
    }),
  ]);
  console.log(`  Created ${suppliers.length} suppliers`);

  // --- Product SKUs ---
  const products = await Promise.all([
    prisma.productSku.upsert({
      where: { sku: 'GOLD_AE_1OZ' },
      update: {},
      create: {
        sku: 'GOLD_AE_1OZ',
        metal: 'XAU',
        name: '1 oz American Gold Eagle',
        weightOz: 1,
        purity: 0.9167,
        category: 'COIN',
        images: [],
        eligibleDeliveryTypes: ['DIRECT_SHIP', 'VAULT_ALLOCATE'],
        flags: ['IRA_ELIGIBLE'],
      },
    }),
    prisma.productSku.upsert({
      where: { sku: 'GOLD_BAR_1OZ' },
      update: {},
      create: {
        sku: 'GOLD_BAR_1OZ',
        metal: 'XAU',
        name: '1 oz Gold Bar (PAMP Suisse)',
        weightOz: 1,
        purity: 0.9999,
        category: 'BAR',
        images: [],
        eligibleDeliveryTypes: ['DIRECT_SHIP', 'VAULT_ALLOCATE'],
        flags: ['IRA_ELIGIBLE'],
      },
    }),
    prisma.productSku.upsert({
      where: { sku: 'GOLD_BAR_10OZ' },
      update: {},
      create: {
        sku: 'GOLD_BAR_10OZ',
        metal: 'XAU',
        name: '10 oz Gold Bar',
        weightOz: 10,
        purity: 0.9999,
        category: 'BAR',
        images: [],
        eligibleDeliveryTypes: ['DIRECT_SHIP', 'VAULT_ALLOCATE'],
        flags: ['IRA_ELIGIBLE'],
      },
    }),
    prisma.productSku.upsert({
      where: { sku: 'SILVER_AE_1OZ' },
      update: {},
      create: {
        sku: 'SILVER_AE_1OZ',
        metal: 'XAG',
        name: '1 oz American Silver Eagle',
        weightOz: 1,
        purity: 0.999,
        category: 'COIN',
        images: [],
        eligibleDeliveryTypes: ['DIRECT_SHIP', 'VAULT_ALLOCATE'],
        flags: ['IRA_ELIGIBLE'],
      },
    }),
    prisma.productSku.upsert({
      where: { sku: 'SILVER_BAR_100OZ' },
      update: {},
      create: {
        sku: 'SILVER_BAR_100OZ',
        metal: 'XAG',
        name: '100 oz Silver Bar',
        weightOz: 100,
        purity: 0.999,
        category: 'BAR',
        images: [],
        eligibleDeliveryTypes: ['VAULT_ALLOCATE'],
        flags: ['IRA_ELIGIBLE'],
      },
    }),
    prisma.productSku.upsert({
      where: { sku: 'SILVER_ROUND_1OZ' },
      update: {},
      create: {
        sku: 'SILVER_ROUND_1OZ',
        metal: 'XAG',
        name: '1 oz Silver Round',
        weightOz: 1,
        purity: 0.999,
        category: 'ROUND',
        images: [],
        eligibleDeliveryTypes: ['DIRECT_SHIP'],
        flags: [],
      },
    }),
  ]);
  console.log(`  Created ${products.length} product SKUs`);

  // --- Supplier Offers ---
  const offers = await Promise.all([
    // Dillon Gage offers
    prisma.supplierOffer.upsert({
      where: { id: '00000000-0000-0000-0000-000000000201' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000201',
        productSkuId: products[0]!.id, // Gold Eagle
        supplierId: suppliers[0]!.id,
        availableQty: 500,
        shipEtaDays: 3,
        shipOrigin: 'TX, USA',
        premiumUsd: 42.00,
        constraints: ['IRA_OK', 'VAULT_ALLOCATE_OK'],
      },
    }),
    prisma.supplierOffer.upsert({
      where: { id: '00000000-0000-0000-0000-000000000202' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000202',
        productSkuId: products[1]!.id, // Gold Bar 1oz
        supplierId: suppliers[0]!.id,
        availableQty: 200,
        shipEtaDays: 2,
        shipOrigin: 'TX, USA',
        premiumUsd: 24.00,
        constraints: ['IRA_OK', 'VAULT_ALLOCATE_OK'],
      },
    }),
    prisma.supplierOffer.upsert({
      where: { id: '00000000-0000-0000-0000-000000000203' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000203',
        productSkuId: products[3]!.id, // Silver Eagle
        supplierId: suppliers[0]!.id,
        availableQty: 5000,
        shipEtaDays: 3,
        shipOrigin: 'TX, USA',
        premiumUsd: 3.50,
        constraints: ['IRA_OK', 'VAULT_ALLOCATE_OK'],
      },
    }),
    // Upstate offers
    prisma.supplierOffer.upsert({
      where: { id: '00000000-0000-0000-0000-000000000204' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000204',
        productSkuId: products[0]!.id, // Gold Eagle
        supplierId: suppliers[1]!.id,
        availableQty: 300,
        shipEtaDays: 5,
        shipOrigin: 'NY, USA',
        premiumUsd: 38.00,
        constraints: ['IRA_OK'],
      },
    }),
    prisma.supplierOffer.upsert({
      where: { id: '00000000-0000-0000-0000-000000000205' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000205',
        productSkuId: products[4]!.id, // Silver 100oz Bar
        supplierId: suppliers[1]!.id,
        availableQty: 100,
        shipEtaDays: 7,
        shipOrigin: 'NY, USA',
        premiumUsd: 85.00,
        constraints: ['IRA_OK', 'VAULT_ALLOCATE_OK'],
      },
    }),
    // A-Mark offers
    prisma.supplierOffer.upsert({
      where: { id: '00000000-0000-0000-0000-000000000206' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000206',
        productSkuId: products[2]!.id, // Gold 10oz Bar
        supplierId: suppliers[2]!.id,
        availableQty: 50,
        shipEtaDays: 4,
        shipOrigin: 'CA, USA',
        premiumUsd: 180.00,
        constraints: ['IRA_OK', 'VAULT_ALLOCATE_OK'],
      },
    }),
    prisma.supplierOffer.upsert({
      where: { id: '00000000-0000-0000-0000-000000000207' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000207',
        productSkuId: products[5]!.id, // Silver Round
        supplierId: suppliers[2]!.id,
        availableQty: 10000,
        shipEtaDays: 3,
        shipOrigin: 'CA, USA',
        premiumUsd: 2.00,
        constraints: [],
      },
    }),
  ]);
  console.log(`  Created ${offers.length} supplier offers`);

  // --- Seed initial spot prices ---
  const now = new Date();
  await Promise.all([
    prisma.metalSpot.upsert({
      where: { metal_asOf: { metal: 'XAU', asOf: now } },
      update: {},
      create: { metal: 'XAU', spotUsdPerOz: 2648.50, changePct24h: 0.32, source: 'seed', asOf: now },
    }),
    prisma.metalSpot.upsert({
      where: { metal_asOf: { metal: 'XAG', asOf: now } },
      update: {},
      create: { metal: 'XAG', spotUsdPerOz: 31.05, changePct24h: -0.15, source: 'seed', asOf: now },
    }),
  ]);
  console.log('  Created initial spot prices');

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
