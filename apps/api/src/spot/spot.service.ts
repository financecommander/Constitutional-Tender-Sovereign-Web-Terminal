import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Metal } from '@prisma/client';

export interface SpotPrice {
  metal: Metal;
  spotUsdPerOz: number;
  changePct24h: number;
  asOf: string;
  source: string;
}

@Injectable()
export class SpotService {
  private lastUpdate: Date = new Date();
  private readonly STALE_THRESHOLD_MS = 120_000; // 2 minutes

  constructor(private readonly prisma: PrismaService) {}

  async getLatestSpots(): Promise<SpotPrice[]> {
    const metals: Metal[] = ['XAU', 'XAG', 'XPT', 'XPD'];

    const spots = await Promise.all(
      metals.map(async (metal) => {
        const latest = await this.prisma.metalSpot.findFirst({
          where: { metal },
          orderBy: { asOf: 'desc' },
        });

        if (!latest) {
          return {
            metal,
            spotUsdPerOz: 0,
            changePct24h: 0,
            asOf: new Date().toISOString(),
            source: 'none',
          };
        }

        return {
          metal: latest.metal,
          spotUsdPerOz: latest.spotUsdPerOz.toNumber(),
          changePct24h: latest.changePct24h.toNumber(),
          asOf: latest.asOf.toISOString(),
          source: latest.source,
        };
      }),
    );

    this.lastUpdate = new Date();
    return spots;
  }

  async updateSpot(metal: Metal, spotUsdPerOz: number, changePct24h: number, source: string): Promise<SpotPrice> {
    const now = new Date();
    const record = await this.prisma.metalSpot.create({
      data: {
        metal,
        spotUsdPerOz,
        changePct24h,
        source,
        asOf: now,
      },
    });

    this.lastUpdate = now;

    return {
      metal: record.metal,
      spotUsdPerOz: record.spotUsdPerOz.toNumber(),
      changePct24h: record.changePct24h.toNumber(),
      asOf: record.asOf.toISOString(),
      source: record.source,
    };
  }

  isStale(): boolean {
    return Date.now() - this.lastUpdate.getTime() > this.STALE_THRESHOLD_MS;
  }

  getStatus() {
    return {
      lastUpdate: this.lastUpdate.toISOString(),
      isStale: this.isStale(),
      staleThresholdMs: this.STALE_THRESHOLD_MS,
    };
  }
}
