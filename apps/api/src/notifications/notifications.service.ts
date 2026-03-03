import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

/**
 * Email Notifications Service
 *
 * Sends transactional emails for order lifecycle events.
 * Currently logs to console (demo mode).
 *
 * To integrate a real email provider:
 * 1. npm install @sendgrid/mail  (or resend, or nodemailer)
 * 2. Set EMAIL_PROVIDER in .env (sendgrid | resend | smtp)
 * 3. Set EMAIL_API_KEY in .env
 * 4. Set EMAIL_FROM in .env (e.g., orders@constitutionaltender.com)
 * 5. Uncomment the provider-specific send methods below
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  private readonly provider = process.env.EMAIL_PROVIDER || 'console';
  private readonly apiKey = process.env.EMAIL_API_KEY || '';
  private readonly fromEmail = process.env.EMAIL_FROM || 'noreply@constitutionaltender.com';

  constructor(private readonly prisma: PrismaService) {
    if (this.provider === 'console') {
      this.logger.warn('EMAIL_PROVIDER not set — emails will be logged to console');
    }
  }

  /**
   * Send an email
   */
  async send(payload: EmailPayload): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'sendgrid':
          return this.sendViaSendGrid(payload);
        case 'resend':
          return this.sendViaResend(payload);
        case 'smtp':
          return this.sendViaSmtp(payload);
        default:
          return this.sendToConsole(payload);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${payload.to}: ${error}`);
      return false;
    }
  }

  /**
   * Console output (demo mode)
   */
  private async sendToConsole(payload: EmailPayload): Promise<boolean> {
    this.logger.log(`[EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
    this.logger.debug(`[EMAIL BODY] ${payload.text || payload.html.slice(0, 200)}`);
    return true;
  }

  /**
   * SendGrid integration (placeholder)
   */
  private async sendViaSendGrid(payload: EmailPayload): Promise<boolean> {
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.apiKey);
    // await sgMail.send({
    //   to: payload.to,
    //   from: this.fromEmail,
    //   subject: payload.subject,
    //   html: payload.html,
    //   text: payload.text,
    // });
    this.logger.log(`[SendGrid] Would send to ${payload.to}: ${payload.subject}`);
    return true;
  }

  /**
   * Resend integration (placeholder)
   */
  private async sendViaResend(payload: EmailPayload): Promise<boolean> {
    // const { Resend } = require('resend');
    // const resend = new Resend(this.apiKey);
    // await resend.emails.send({
    //   from: this.fromEmail,
    //   to: payload.to,
    //   subject: payload.subject,
    //   html: payload.html,
    // });
    this.logger.log(`[Resend] Would send to ${payload.to}: ${payload.subject}`);
    return true;
  }

  /**
   * SMTP integration (placeholder)
   */
  private async sendViaSmtp(payload: EmailPayload): Promise<boolean> {
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: parseInt(process.env.SMTP_PORT || '587'),
    //   secure: process.env.SMTP_SECURE === 'true',
    //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // });
    // await transporter.sendMail({
    //   from: this.fromEmail,
    //   to: payload.to,
    //   subject: payload.subject,
    //   html: payload.html,
    //   text: payload.text,
    // });
    this.logger.log(`[SMTP] Would send to ${payload.to}: ${payload.subject}`);
    return true;
  }

  // ==================
  // Order Lifecycle Emails
  // ==================

  async sendOrderConfirmation(orderId: string) {
    const order = await this.getOrderDetails(orderId);
    if (!order) return;

    await this.send({
      to: order.userEmail,
      subject: `Order Confirmed — ${order.productName} (${order.orderId})`,
      html: this.orderConfirmationTemplate(order),
      text: `Your order for ${order.quantity}x ${order.productName} has been confirmed. Total: $${order.totalUsd}. Order ID: ${order.orderId}`,
    });
  }

  async sendFundsConfirmed(orderId: string) {
    const order = await this.getOrderDetails(orderId);
    if (!order) return;

    await this.send({
      to: order.userEmail,
      subject: `Funds Confirmed — Order ${order.orderId}`,
      html: this.statusUpdateTemplate(order, 'Funds Confirmed', 'Your payment has been received and confirmed.'),
      text: `Funds confirmed for order ${order.orderId}. We will now process your order with the supplier.`,
    });
  }

  async sendShipmentCreated(orderId: string, trackingNumber?: string) {
    const order = await this.getOrderDetails(orderId);
    if (!order) return;

    await this.send({
      to: order.userEmail,
      subject: `Shipment Created — Order ${order.orderId}`,
      html: this.statusUpdateTemplate(
        order,
        'Shipment Created',
        trackingNumber
          ? `Your order has been shipped. Tracking: ${trackingNumber}`
          : 'Your order has been shipped and is on its way.',
      ),
      text: `Your order ${order.orderId} has been shipped. ${trackingNumber ? `Tracking: ${trackingNumber}` : ''}`,
    });
  }

  async sendOrderDelivered(orderId: string) {
    const order = await this.getOrderDetails(orderId);
    if (!order) return;

    await this.send({
      to: order.userEmail,
      subject: `Delivered — Order ${order.orderId}`,
      html: this.statusUpdateTemplate(order, 'Delivered', 'Your order has been delivered. A receipt is available in your account.'),
      text: `Your order ${order.orderId} has been delivered. View your receipt at /app/receipts/${order.orderId}`,
    });
  }

  // ==================
  // Helpers
  // ==================

  private async getOrderDetails(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { email: true, fullName: true } },
        quote: { include: { productSku: true } },
      },
    });

    if (!order || !order.user) return null;

    return {
      orderId: order.id,
      userEmail: order.user.email,
      userName: order.user.fullName || 'Customer',
      productName: order.quote.productSku.name,
      quantity: order.quote.quantity,
      totalUsd: order.receiptTotal.toNumber().toFixed(2),
      status: order.status,
    };
  }

  private orderConfirmationTemplate(order: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #102a43; padding: 24px; text-align: center;">
          <h1 style="color: #de8b1a; margin: 0;">Constitutional Tender</h1>
        </div>
        <div style="padding: 24px; background: #f5f5f5;">
          <h2 style="color: #102a43;">Order Confirmed</h2>
          <p>Hi ${order.userName},</p>
          <p>Your order has been successfully placed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Order ID</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.orderId}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Product</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.quantity}x ${order.productName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">$${order.totalUsd}</td></tr>
          </table>
          <p>You can track your order status in your account dashboard.</p>
        </div>
        <div style="background: #102a43; padding: 16px; text-align: center; color: #829ab1; font-size: 12px;">
          <p>Constitutional Tender — Lawful Money. Modern Execution.</p>
        </div>
      </div>
    `;
  }

  private statusUpdateTemplate(order: any, status: string, message: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #102a43; padding: 24px; text-align: center;">
          <h1 style="color: #de8b1a; margin: 0;">Constitutional Tender</h1>
        </div>
        <div style="padding: 24px; background: #f5f5f5;">
          <h2 style="color: #102a43;">Order Update: ${status}</h2>
          <p>Hi ${order.userName},</p>
          <p>${message}</p>
          <p><strong>Order:</strong> ${order.orderId}<br/><strong>Product:</strong> ${order.quantity}x ${order.productName}</p>
        </div>
        <div style="background: #102a43; padding: 16px; text-align: center; color: #829ab1; font-size: 12px;">
          <p>Constitutional Tender — Lawful Money. Modern Execution.</p>
        </div>
      </div>
    `;
  }
}
