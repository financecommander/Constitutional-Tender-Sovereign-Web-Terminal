import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma.service';

/**
 * Payments Module
 * 
 * Provides Stripe payment processing services
 */
@Module({
  imports: [ConfigModule],
  providers: [StripeService, PrismaService],
  exports: [StripeService],
})
export class PaymentsModule {}
