import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { PlaidService } from './plaid.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, UserFromToken } from '../auth/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class ExchangeTokenDto {
  @IsString()
  declare publicToken: string;
}

/**
 * Payments Controller
 *
 * Handles Stripe payment intents and Plaid bank account linking.
 * All endpoints except /payments/stripe/webhook require authentication.
 */
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly plaidService: PlaidService,
  ) {}

  @Post('stripe/create-intent')
  @UseGuards(JwtAuthGuard)
  createPaymentIntent(
    @CurrentUser() user: UserFromToken,
    @Body(ValidationPipe) dto: CreatePaymentIntentDto,
  ) {
    return this.stripeService.createPaymentIntent(dto.amount, user.authId);
  }

  @Post('stripe/confirm')
  @UseGuards(JwtAuthGuard)
  confirmPayment(
    @Body(ValidationPipe) dto: ConfirmPaymentDto,
  ) {
    return this.stripeService.confirmPayment(dto.paymentIntentId);
  }

  @Post('stripe/webhook')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody ?? Buffer.alloc(0);
    const event = await this.stripeService.handleWebhook(payload, signature);
    return { received: true, type: event.type };
  }

  @Post('plaid/link-token')
  @UseGuards(JwtAuthGuard)
  createLinkToken(@CurrentUser() user: UserFromToken) {
    return this.plaidService.createLinkToken(user.authId);
  }

  @Post('plaid/exchange-token')
  @UseGuards(JwtAuthGuard)
  exchangeToken(
    @CurrentUser() user: UserFromToken,
    @Body(ValidationPipe) dto: ExchangeTokenDto,
  ) {
    return this.plaidService.exchangePublicToken(dto.publicToken, user.authId);
  }
}
