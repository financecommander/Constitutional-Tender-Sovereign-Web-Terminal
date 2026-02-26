import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { PlaidService } from './plaid.service';
import { PaymentsController } from './payments.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [PaymentsController],
  providers: [StripeService, PlaidService],
  exports: [StripeService, PlaidService],
})
export class PaymentsModule {}
