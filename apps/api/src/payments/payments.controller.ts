import { Controller, Post, Get, Param, Body, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  async createPaymentIntent(
    @Body() body: { orderId: string; amountUsd: number; rail: 'WIRE' | 'ACH' | 'CRYPTO' },
  ) {
    return this.paymentsService.createPaymentIntent(body.orderId, body.amountUsd, body.rail);
  }

  @Get('intent/:intentId')
  async getPaymentIntent(@Param('intentId') intentId: string) {
    return this.paymentsService.getPaymentIntent(intentId);
  }

  @Get('order/:orderId')
  async getPaymentForOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentIntentForOrder(orderId);
  }

  @Post('webhook/stripe')
  @Public()
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (rawBody) {
      await this.paymentsService.handleWebhook(rawBody, signature);
    }
    return { received: true };
  }
}
