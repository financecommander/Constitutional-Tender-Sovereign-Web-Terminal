import { Module } from '@nestjs/common';
import { SpotService } from './spot.service';
import { SpotFeedService } from './spot-feed.service';
import { SpotController } from './spot.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SpotController],
  providers: [SpotService, SpotFeedService, PrismaService],
  exports: [SpotService],
})
export class SpotModule {}
