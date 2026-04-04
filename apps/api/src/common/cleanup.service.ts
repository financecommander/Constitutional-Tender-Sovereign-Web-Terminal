import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Clean expired, unused quotes every hour
   */
  @Cron('0 * * * *')
  async cleanExpiredQuotes() {
    const result = await this.prisma.quote.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        isUsed: false,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned ${result.count} expired quotes`);
    }
  }

  /**
   * Prune MetalSpot records older than 24 hours (keep latest per metal)
   * Runs daily at 3 AM
   */
  @Cron('0 3 * * *')
  async pruneOldSpotData() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await this.prisma.metalSpot.deleteMany({
      where: {
        createdAt: { lt: cutoff },
      },
    });

    if (result.count > 0) {
      this.logger.log(`Pruned ${result.count} old MetalSpot records`);
    }
  }
}
