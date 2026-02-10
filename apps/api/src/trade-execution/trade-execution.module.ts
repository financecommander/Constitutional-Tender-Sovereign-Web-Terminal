import { Module } from '@nestjs/common';
import { TradeExecutionController } from './trade-execution.controller';
import { TradeExecutionService } from './trade-execution.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TradeExecutionController],
  providers: [TradeExecutionService, PrismaService],
  exports: [TradeExecutionService],
})
export class TradeExecutionModule {}
