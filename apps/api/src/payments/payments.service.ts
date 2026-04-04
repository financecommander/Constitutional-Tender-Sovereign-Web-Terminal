import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentRail } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeLib = require('stripe');

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: any;
  private readonly stripeWebhookSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    this.stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (stripeKey) {
      this.stripe = new StripeLib(stripeKey);
      this.logger.log('Stripe payment processing enabled');
    } else {
      this.stripe = null;
      this.logger.warn('STRIPE_SECRET_KEY not set — payments will use demo mode');
    }
  }

  /**
   * Create a payment intent for an order
   */
  async createPaymentIntent(orderId: string, amountUsd: number, rail: PaymentRail) {
    // Check if payment already exists for this order
    const existing = await this.prisma.paymentRecord.findUnique({
      where: { orderId },
    });
    if (existing) {
      return this.formatPaymentResponse(existing);
    }

    let externalId: string | null = null;
    let clientSecret: string | null = null;

    // Create Stripe PaymentIntent if Stripe is configured
    if (this.stripe && rail !== 'CRYPTO') {
      const stripeIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amountUsd * 100), // cents
        currency: 'usd',
        metadata: { orderId, rail },
        payment_method_types: ['card', 'us_bank_account'],
      });
      externalId = stripeIntent.id;
      clientSecret = stripeIntent.client_secret;
    }

    // Persist to database
    const record = await this.prisma.paymentRecord.create({
      data: {
        orderId,
        externalId,
        rail,
        amountUsd,
        status: 'pending',
      },
    });

    const response = this.formatPaymentResponse(record);
    if (clientSecret) {
      response.stripeClientSecret = clientSecret;
    }
    response.instructions = this.getPaymentInstructions(rail, amountUsd, orderId);

    this.logger.log(`Payment intent created: ${record.id} for order ${orderId} ($${amountUsd} via ${rail})`);
    return response;
  }

  /**
   * Get payment instructions based on rail type
   */
  private getPaymentInstructions(rail: PaymentRail, amountUsd: number, orderId: string): Record<string, string> {
    if (this.stripe && rail !== 'CRYPTO') {
      return {
        method: rail === 'WIRE' ? 'Bank Wire via Stripe' : 'ACH via Stripe',
        note: 'Complete payment using the secure payment form below.',
        amount: `$${amountUsd.toFixed(2)} USD`,
      };
    }

    switch (rail) {
      case 'WIRE':
        return {
          method: 'Wire Transfer',
          reference: `CT-${orderId.slice(0, 8).toUpperCase()}`,
          amount: `$${amountUsd.toFixed(2)} USD`,
          note: 'Wire transfer details will be provided once your payment provider is configured. Contact support for manual wire instructions.',
        };
      case 'ACH':
        return {
          method: 'ACH Bank Transfer',
          reference: `CT-${orderId.slice(0, 8).toUpperCase()}`,
          amount: `$${amountUsd.toFixed(2)} USD`,
          note: 'ACH transfer details will be provided once your payment provider is configured.',
        };
      case 'CRYPTO':
        return {
          method: 'Cryptocurrency',
          acceptedCurrencies: 'BTC, ETH, USDC',
          amount: `$${amountUsd.toFixed(2)} USD equivalent`,
          note: 'Crypto payment integration coming soon. Contact support for manual crypto payment.',
        };
      default:
        return { note: 'Contact support for payment instructions.' };
    }
  }

  /**
   * Get a payment record by ID
   */
  async getPaymentIntent(intentId: string) {
    const record = await this.prisma.paymentRecord.findUnique({
      where: { id: intentId },
    });
    if (!record) throw new NotFoundException(`Payment ${intentId} not found`);
    return this.formatPaymentResponse(record);
  }

  /**
   * Get payment record for an order
   */
  async getPaymentIntentForOrder(orderId: string) {
    const record = await this.prisma.paymentRecord.findUnique({
      where: { orderId },
    });
    if (!record) return null;
    return this.formatPaymentResponse(record);
  }

  /**
   * Confirm a payment (admin action or webhook callback)
   */
  async confirmPayment(intentId: string) {
    const record = await this.prisma.paymentRecord.update({
      where: { id: intentId },
      data: { status: 'completed' },
    });

    // Advance order status
    try {
      await this.ordersService.advanceOrderStatus(record.orderId, 'FUNDS_CONFIRMED', 'Payment confirmed');
      await this.notificationsService.sendFundsConfirmed(record.orderId);
    } catch (error) {
      this.logger.error(`Failed to advance order ${record.orderId} after payment: ${error}`);
    }

    this.logger.log(`Payment confirmed: ${intentId} for order ${record.orderId}`);
    return this.formatPaymentResponse(record);
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!this.stripe || !this.stripeWebhookSecret) {
      this.logger.log('Webhook received but Stripe not configured — ignoring');
      return;
    }

    let event: any;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, this.stripeWebhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          const record = await this.prisma.paymentRecord.findUnique({ where: { orderId } });
          if (record) {
            await this.confirmPayment(record.id);
            this.logger.log(`Stripe payment succeeded for order ${orderId}`);
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await this.prisma.paymentRecord.updateMany({
            where: { orderId },
            data: { status: 'failed' },
          });
          this.logger.warn(`Stripe payment failed for order ${orderId}`);
        }
        break;
      }
    }
  }

  private formatPaymentResponse(record: {
    id: string;
    orderId: string;
    externalId: string | null;
    rail: PaymentRail;
    amountUsd: { toNumber?: () => number } | number;
    status: string;
    createdAt: Date;
  }) {
    return {
      id: record.id,
      orderId: record.orderId,
      rail: record.rail,
      amountUsd: typeof record.amountUsd === 'number' ? record.amountUsd : record.amountUsd.toNumber?.() ?? record.amountUsd,
      status: record.status,
      externalId: record.externalId,
      stripeClientSecret: null as string | null,
      instructions: {} as Record<string, string>,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
