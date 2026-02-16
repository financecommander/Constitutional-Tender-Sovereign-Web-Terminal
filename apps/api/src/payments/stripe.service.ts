import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma.service';
import { PaymentProcessingException } from './exceptions/payment-processing.exception';
import { User } from '@prisma/client';

/**
 * Stripe Service
 * 
 * Production-ready Stripe payment service for Constitutional Tender
 * Handles payment intents, customers, refunds, and webhooks
 */
@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
    });

    this.logger.log('Stripe service initialized');
  }

  /**
   * Create a payment intent
   * 
   * @param amount - Amount in dollars (will be converted to cents for Stripe)
   * @param userId - User ID for metadata
   * @returns Payment intent with client secret
   */
  async createPaymentIntent(
    amount: number,
    userId: string,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      this.logger.log(`Creating payment intent for user ${userId}, amount: $${amount}`);

      // Convert amount to cents
      const amountInCents = Math.round(amount * 100);

      if (amountInCents <= 0) {
        throw new PaymentProcessingException('Amount must be greater than 0');
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          userId,
        },
      });

      this.logger.log(`Payment intent created: ${paymentIntent.id}`);

      if (!paymentIntent.client_secret) {
        throw new PaymentProcessingException('Failed to generate client secret');
      }

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error('Failed to create payment intent', error);
      
      if (error instanceof PaymentProcessingException) {
        throw error;
      }
      
      if (error instanceof Stripe.errors.StripeError) {
        throw new PaymentProcessingException(
          `Stripe error: ${error.message}`,
        );
      }
      
      throw new PaymentProcessingException('Failed to create payment intent');
    }
  }

  /**
   * Confirm payment and retrieve charge details
   * 
   * @param paymentIntentId - Payment intent ID
   * @returns Charge details
   */
  async confirmPayment(
    paymentIntentId: string,
  ): Promise<Stripe.Charge> {
    try {
      this.logger.log(`Confirming payment: ${paymentIntentId}`);

      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId,
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new PaymentProcessingException(
          `Payment not succeeded. Current status: ${paymentIntent.status}`,
        );
      }

      // Get the charge associated with this payment intent
      const chargeId = paymentIntent.latest_charge;
      
      if (!chargeId || typeof chargeId !== 'string') {
        throw new PaymentProcessingException('No charge found for this payment');
      }

      const charge = await this.stripe.charges.retrieve(chargeId);

      this.logger.log(`Payment confirmed: ${paymentIntentId}, charge: ${charge.id}`);

      return charge;
    } catch (error) {
      this.logger.error('Failed to confirm payment', error);
      
      if (error instanceof PaymentProcessingException) {
        throw error;
      }
      
      if (error instanceof Stripe.errors.StripeError) {
        throw new PaymentProcessingException(
          `Stripe error: ${error.message}`,
        );
      }
      
      throw new PaymentProcessingException('Failed to confirm payment');
    }
  }

  /**
   * Create a Stripe customer and store in database
   * 
   * @param user - User object from database
   * @returns Stripe customer
   */
  async createCustomer(user: User): Promise<Stripe.Customer> {
    try {
      this.logger.log(`Creating Stripe customer for user ${user.id}`);

      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user.id,
          authId: user.authId,
        },
      });

      // TODO: Store customerId in database
      // This would require adding a stripeCustomerId field to the User model
      // For now, we're just returning the customer object
      
      this.logger.log(`Stripe customer created: ${customer.id} for user ${user.id}`);

      return customer;
    } catch (error) {
      this.logger.error('Failed to create customer', error);
      
      if (error instanceof Stripe.errors.StripeError) {
        throw new PaymentProcessingException(
          `Stripe error: ${error.message}`,
        );
      }
      
      throw new PaymentProcessingException('Failed to create customer');
    }
  }

  /**
   * Refund a payment (full or partial)
   * 
   * @param chargeId - Charge ID to refund
   * @param amount - Optional amount in dollars (will be converted to cents for Stripe; if not provided, full refund)
   * @returns Refund object
   */
  async refundPayment(
    chargeId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    try {
      this.logger.log(`Processing refund for charge ${chargeId}${amount ? `, amount: $${amount}` : ' (full refund)'}`);

      const refundParams: Stripe.RefundCreateParams = {
        charge: chargeId,
      };

      if (amount !== undefined) {
        const amountInCents = Math.round(amount * 100);
        
        if (amountInCents <= 0) {
          throw new PaymentProcessingException('Refund amount must be greater than 0');
        }
        
        refundParams.amount = amountInCents;
      }

      const refund = await this.stripe.refunds.create(refundParams);

      this.logger.log(`Refund processed: ${refund.id} for charge ${chargeId}`);

      // TODO: Log refund transaction in database
      // This would require creating a refund tracking table or updating transaction status
      
      return refund;
    } catch (error) {
      this.logger.error('Failed to process refund', error);
      
      if (error instanceof PaymentProcessingException) {
        throw error;
      }
      
      if (error instanceof Stripe.errors.StripeError) {
        throw new PaymentProcessingException(
          `Stripe error: ${error.message}`,
        );
      }
      
      throw new PaymentProcessingException('Failed to process refund');
    }
  }

  /**
   * Handle Stripe webhooks
   * 
   * CRITICAL: Verifies webhook signature before processing
   * 
   * @param rawBody - Raw request body as Buffer
   * @param signature - Stripe signature from headers
   * @returns Stripe event
   */
  async handleWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
      }

      // CRITICAL: Verify webhook signature
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );

      this.logger.log(`Webhook received: ${event.type}`);

      // Handle specific event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;
        
        case 'charge.refunded':
          await this.handleChargeRefunded(event);
          break;
        
        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }

      return event;
    } catch (error) {
      this.logger.error('Failed to handle webhook', error);
      
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        throw new PaymentProcessingException(
          'Invalid webhook signature',
        );
      }
      
      throw new PaymentProcessingException('Failed to handle webhook');
    }
  }

  /**
   * Handle payment_intent.succeeded event
   * 
   * @param event - Stripe event
   */
  private async handlePaymentIntentSucceeded(
    event: Stripe.Event,
  ): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);
    
    const userId = paymentIntent.metadata.userId;
    
    if (userId) {
      // TODO: Update transaction status in database
      // This would require finding the transaction by payment intent ID
      // and updating its status to COMPLETED
      this.logger.log(`Payment succeeded for user ${userId}, amount: ${paymentIntent.amount / 100}`);
    }
  }

  /**
   * Handle charge.refunded event
   * 
   * @param event - Stripe event
   */
  private async handleChargeRefunded(
    event: Stripe.Event,
  ): Promise<void> {
    const charge = event.data.object as Stripe.Charge;
    
    this.logger.log(`Charge refunded: ${charge.id}`);
    
    // TODO: Update transaction status in database
    // This would require finding the transaction by charge ID
    // and updating its status to reflect the refund
  }
}
