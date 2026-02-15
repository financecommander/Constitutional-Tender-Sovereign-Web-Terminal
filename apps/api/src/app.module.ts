import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MarketDataModule } from './market-data/market-data.module';
import { TradeExecutionModule } from './trade-execution/trade-execution.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule, MarketDataModule, TradeExecutionModule, PaymentsModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
