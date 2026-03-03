import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { QuotesModule } from '../quotes/quotes.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [QuotesModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService],
})
export class OrdersModule {}
