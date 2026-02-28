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
      create: {
        name: 'Gold 1 oz',
        symbol: 'XAU-1OZ',
        metalType: 'GOLD',
        weightOz: 1,
        livePriceBid: 2648.50,
        livePriceAsk: 2653.80,
        spreadPercent: 0.20,
      },
    }),
    prisma.asset.upsert({
      where: { symbol: 'XAU-10OZ' },
      update: { livePriceBid: 26485.00, livePriceAsk: 26538.00, spreadPercent: 0.20 },
      create: {
        name: 'Gold 10 oz Bar',
        symbol: 'XAU-10OZ',
        metalType: 'GOLD',
        weightOz: 10,
        livePriceBid: 26485.00,
        livePriceAsk: 26538.00,
        spreadPercent: 0.20,
      },
    }),
    prisma.asset.upsert({
      where: { symbol: 'XAG-1OZ' },
      update: { livePriceBid: 31.05, livePriceAsk: 31.25, spreadPercent: 0.64 },
      create: {
        name: 'Silver 1 oz',
        symbol: 'XAG-1OZ',
        metalType: 'SILVER',
        weightOz: 1,
        livePriceBid: 31.05,
        livePriceAsk: 31.25,
        spreadPercent: 0.64,
      },
    }),
    prisma.asset.upsert({
      where: { symbol: 'XAG-100OZ' },
      update: { livePriceBid: 3105.00, livePriceAsk: 3125.00, spreadPercent: 0.64 },
      create: {
        name: 'Silver 100 oz Bar',
        symbol: 'XAG-100OZ',
        metalType: 'SILVER',
        weightOz: 100,
        livePriceBid: 3105.00,
        livePriceAsk: 3125.00,
        spreadPercent: 0.64,
      },
    }),
    prisma.asset.upsert({
      where: { symbol: 'XPT-1OZ' },
      update: { livePriceBid: 962.00, livePriceAsk: 972.00, spreadPercent: 1.04 },
      create: {
        name: 'Platinum 1 oz',
        symbol: 'XPT-1OZ',
        metalType: 'PLATINUM',
        weightOz: 1,
        livePriceBid: 962.00,
        livePriceAsk: 972.00,
        spreadPercent: 1.04,
      },
    }),
    prisma.asset.upsert({
      where: { symbol: 'XPD-1OZ' },
      update: { livePriceBid: 952.00, livePriceAsk: 965.00, spreadPercent: 1.36 },
      create: {
        name: 'Palladium 1 oz',
        symbol: 'XPD-1OZ',
        metalType: 'PALLADIUM',
        weightOz: 1,
        livePriceBid: 952.00,
        livePriceAsk: 965.00,
        spreadPercent: 1.36,
      },
    }),
  ]);

  console.log(`  Created ${assets.length} assets`);
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
