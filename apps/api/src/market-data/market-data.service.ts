import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MarketDataService {
  constructor(private readonly prisma: PrismaService) {}

  async getLivePrices() {
    return this.prisma.asset.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        symbol: true,
        metalType: true,
        weightOz: true,
        livePriceBid: true,
        livePriceAsk: true,
        spreadPercent: true,
      },
    });
  }

  async getAssetPrice(symbol: string) {
    return this.prisma.asset.findUnique({
      where: { symbol },
      select: {
        id: true,
        name: true,
        symbol: true,
        livePriceBid: true,
        livePriceAsk: true,
        spreadPercent: true,
        updatedAt: true,
      },
    });
  }

  async getFxRates() {
    // TODO: Integrate with live FX rate provider
    return {
      baseCurrency: 'USD',
      rates: {
        EUR: 0.92,
        CHF: 0.88,
        SGD: 1.34,
        KYD: 0.82,
        GBP: 0.79,
      },
      updatedAt: new Date().toISOString(),
    };
  }
}
