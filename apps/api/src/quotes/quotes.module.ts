import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { SpotModule } from '../spot/spot.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [SpotModule],
  controllers: [QuotesController],
  providers: [QuotesService, PrismaService],
  exports: [QuotesService],
})
export class QuotesModule {}
