import { Module } from '@nestjs/common';
import { SpotService } from './spot.service';
import { SpotController } from './spot.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SpotController],
  providers: [SpotService, PrismaService],
  exports: [SpotService],
})
export class SpotModule {}
