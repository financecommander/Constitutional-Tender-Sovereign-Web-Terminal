import { Module } from '@nestjs/common';
import { TradeExecutionController } from './trade-execution.controller';
import { TradeExecutionService } from './trade-execution.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Import AuthModule to use JwtAuthGuard
  controllers: [TradeExecutionController],
  providers: [TradeExecutionService, PrismaService],
  exports: [TradeExecutionService],
})
export class TradeExecutionModule {}
