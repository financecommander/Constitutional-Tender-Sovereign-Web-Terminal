import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentRail } from '@prisma/client';

/**
 * Payments Service
 *
 * Handles payment processing for orders. Currently supports:
 * - WIRE: Wire transfer (manual confirmation)
 * - ACH: ACH bank transfer (manual confirmation)
 * - CRYPTO: Cryptocurrency (placeholder for BTCPay/Coinbase Commerce)
 *
 * To integrate Stripe:
 * 1. npm install stripe
 * 2. Set STRIPE_SECRET_KEY in .env
 * 3. Set STRIPE_WEBHOOK_SECRET in .env
 * 4. Uncomment Stripe integration methods below
 */

export interface PaymentIntent {
  id: string;
  orderId: string;
  rail: PaymentRail;
  amountUsd: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  instructions: Record<string, string>;
  externalId?: string;
  createdAt: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly stripeKey = process.env.STRIPE_SECRET_KEY || '';
  private readonly stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  // In-memory payment intents (production: use database table)
  private paymentIntents: Map<string, PaymentIntent> = new Map();

  constructor(private readonly prisma: PrismaService) {
    if (!this.stripeKey) {
      this.logger.warn('STRIPE_SECRET_KEY not set — payments will use demo mode');
    }
  }

  /**
   * Create a payment intent for an order
   */
  async createPaymentIntent(orderId: string, amountUsd: number, rail: PaymentRail): Promise<PaymentIntent> {
    const intentId = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const intent: PaymentIntent = {
      id: intentId,
      orderId,
      rail,
      amountUsd,
      status: 'pending',
      instructions: this.getPaymentInstructions(rail, amountUsd, orderId),
      createdAt: new Date().toISOString(),
    };

    // If Stripe is configured and rail is WIRE/ACH, create a Stripe PaymentIntent
    // if (this.stripeKey && (rail === 'WIRE' || rail === 'ACH')) {
    //   const stripe = require('stripe')(this.stripeKey);
    //   const stripeIntent = await stripe.paymentIntents.create({
    //     amount: Math.round(amountUsd * 100), // cents
    //     currency: 'usd',
    //     metadata: { orderId, rail },
    //     payment_method_types: rail === 'WIRE' ? ['us_bank_account'] : ['us_bank_account'],
    //   });
    //   intent.externalId = stripeIntent.id;
    //   intent.instructions.stripeClientSecret = stripeIntent.client_secret;
    // }

    this.paymentIntents.set(intentId, intent);
    this.logger.log(`Payment intent created: ${intentId} for order ${orderId} ($${amountUsd} via ${rail})`);

    return intent;
  }

  /**
   * Get payment instructions based on rail type
   */
  private getPaymentInstructions(rail: PaymentRail, amountUsd: number, orderId: string): Record<string, string> {
    switch (rail) {
      case 'WIRE':
        return {
          method: 'Wire Transfer',
          bankName: 'Constitutional Tender Trust Bank',
          routingNumber: 'XXXXXXXXX',
          accountNumber: 'XXXXXXXXX',
          reference: `CT-${orderId.slice(0, 8).toUpperCase()}`,
          amount: `$${amountUsd.toFixed(2)} USD`,
          note: 'Include the reference number in your wire memo. Funds typically clear within 1-2 business days.',
        };
      case 'ACH':
        return {
          method: 'ACH Bank Transfer',
          bankName: 'Constitutional Tender Trust Bank',
          routingNumber: 'XXXXXXXXX',
          accountNumber: 'XXXXXXXXX',
          reference: `CT-${orderId.slice(0, 8).toUpperCase()}`,
          amount: `$${amountUsd.toFixed(2)} USD`,
          note: 'ACH transfers typically clear within 3-5 business days.',
        };
      case 'CRYPTO':
        return {
          method: 'Cryptocurrency',
          acceptedCurrencies: 'BTC, ETH, USDC',
          walletAddress: 'Will be provided after payment provider integration',
          amount: `$${amountUsd.toFixed(2)} USD equivalent`,
          note: 'Crypto payments are confirmed after sufficient network confirmations.',
        };
      default:
        return { note: 'Contact support for payment instructions.' };
    }
  }

  /**
   * Get a payment intent by ID
   */
  async getPaymentIntent(intentId: string): Promise<PaymentIntent | null> {
    return this.paymentIntents.get(intentId) || null;
  }

  /**
   * Get payment intent for an order
   */
  async getPaymentIntentForOrder(orderId: string): Promise<PaymentIntent | null> {
    for (const intent of this.paymentIntents.values()) {
      if (intent.orderId === orderId) return intent;
    }
    return null;
  }

  /**
   * Confirm a payment (admin action or webhook callback)
   */
  async confirmPayment(intentId: string): Promise<PaymentIntent> {
    const intent = this.paymentIntents.get(intentId);
    if (!intent) {
      throw new BadRequestException(`Payment intent ${intentId} not found`);
    }

    intent.status = 'completed';
    this.paymentIntents.set(intentId, intent);

    this.logger.log(`Payment confirmed: ${intentId} for order ${intent.orderId}`);
    return intent;
  }

  /**
   * Handle Stripe webhook (placeholder)
   */
  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    // if (this.stripeKey && this.stripeWebhookSecret) {
    //   const stripe = require('stripe')(this.stripeKey);
    //   const event = stripe.webhooks.constructEvent(payload, signature, this.stripeWebhookSecret);
    //
    //   switch (event.type) {
    //     case 'payment_intent.succeeded':
    //       const intentId = event.data.object.metadata.intentId;
    //       await this.confirmPayment(intentId);
    //       // Also advance order status
    //       break;
    //     case 'payment_intent.payment_failed':
    //       // Handle failure
    //       break;
    //   }
    // }

    this.logger.log('Webhook received (Stripe integration pending)');
  }
}
