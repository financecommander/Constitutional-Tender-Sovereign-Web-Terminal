import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentProcessingException } from './exceptions/payment-processing.exception';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface RefundResult {
  id: string;
  amount: number;
  status: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
    });
  }

  async createPaymentIntent(
    amount: number,
    userId: string,
  ): Promise<PaymentIntent> {
    this.logger.log(
      `Creating payment intent for user ${userId}, amount ${amount}`,
    );

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId,
          platform: 'constitutional-tender',
        },
      });

      this.logger.log(`Payment intent created: ${intent.id}`);
      return {
        id: intent.id,
        clientSecret: intent.client_secret ?? '',
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create payment intent: ${(error as Error).message}`,
      );
      throw new PaymentProcessingException((error as Error).message);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    this.logger.log(`Confirming payment intent: ${paymentIntentId}`);

    try {
      const intent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (intent.status !== 'succeeded') {
        throw new PaymentProcessingException(
          `Payment not succeeded. Current status: ${intent.status}`,
        );
      }

      this.logger.log(`Payment confirmed: ${paymentIntentId}`);
      return {
        id: intent.id,
        clientSecret: intent.client_secret ?? '',
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
      };
    } catch (error) {
      if (error instanceof PaymentProcessingException) {
        throw error;
      }
      this.logger.error(
        `Failed to confirm payment: ${(error as Error).message}`,
      );
      throw new PaymentProcessingException((error as Error).message);
    }
  }

  async refundPayment(
    paymentIntentId: string,
    amount?: number,
  ): Promise<RefundResult> {
    this.logger.log(`Refunding payment intent: ${paymentIntentId}`);

    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount !== undefined) {
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundParams);

      this.logger.log(`Refund created: ${refund.id}`);
      return {
        id: refund.id,
        amount: refund.amount,
        status: refund.status ?? 'unknown',
      };
    } catch (error) {
      this.logger.error(
        `Failed to refund payment: ${(error as Error).message}`,
      );
      throw new PaymentProcessingException((error as Error).message);
    }
  }

  async handleWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
      this.logger.log(`Webhook received: ${event.type}`);
      return event;
    } catch (error) {
      this.logger.error(
        `Webhook signature verification failed: ${(error as Error).message}`,
      );
      throw new PaymentProcessingException(
        `Webhook verification failed: ${(error as Error).message}`,
      );
    }
  }
}
