import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaService } from '../prisma.service';
import { SpotModule } from '../spot/spot.module';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { KycModule } from '../kyc/kyc.module';

@Module({
  imports: [SpotModule, OrdersModule, NotificationsModule, KycModule],
  controllers: [AdminController],
  providers: [PrismaService],
})
export class AdminModule {}
