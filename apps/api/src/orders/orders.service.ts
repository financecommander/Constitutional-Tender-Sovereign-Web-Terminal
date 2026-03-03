import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuotesService } from '../quotes/quotes.service';
import { PaymentRail, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotesService: QuotesService,
  ) {}

  async createOrder(
    userId: string,
    quoteId: string,
    paymentRail: PaymentRail,
    shipping?: {
      shipName?: string;
      shipAddress?: string;
      shipCity?: string;
      shipState?: string;
      shipZip?: string;
      shipCountry?: string;
    },
  ) {
    // Validate quote is active and belongs to user
    const quote = await this.quotesService.validateQuoteForOrder(quoteId, userId);

    // For DIRECT_SHIP, shipping address is required
    if (quote.deliveryType === 'DIRECT_SHIP') {
      if (!shipping?.shipName || !shipping?.shipAddress || !shipping?.shipCity || !shipping?.shipState || !shipping?.shipZip) {
        throw new BadRequestException('Shipping address is required for direct shipment');
      }
    }

    // Create order + initial event in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Mark quote as used
      await tx.quote.update({
        where: { id: quoteId },
        data: { isUsed: true },
      });

      // Create order
      const newOrder = await tx.order.create({
        data: {
          quoteId,
          userId,
          deliveryType: quote.deliveryType,
          paymentRail,
          shipName: shipping?.shipName || null,
          shipAddress: shipping?.shipAddress || null,
          shipCity: shipping?.shipCity || null,
          shipState: shipping?.shipState || null,
          shipZip: shipping?.shipZip || null,
          shipCountry: shipping?.shipCountry || null,
          receiptSpot: quote.lockedSpot,
          receiptPremium: quote.lockedPremium,
          receiptSpread: quote.lockedSpread,
          receiptShipping: quote.lockedShipping,
          receiptTotal: quote.totalUsd,
          status: 'PRICE_LOCKED',
        },
      });

      // Create initial timeline event
      await tx.orderEvent.create({
        data: {
          orderId: newOrder.id,
          stage: 'PRICE_LOCKED',
          note: 'Order created from locked quote',
        },
      });

      return newOrder;
    });

    return this.getOrder(order.id, userId);
  }

  async getOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        quote: {
          include: {
            productSku: true,
            offer: { include: { supplier: true } },
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return {
      id: order.id,
      status: order.status,
      deliveryType: order.deliveryType,
      paymentRail: order.paymentRail,
      product: {
        sku: order.quote.productSku.sku,
        name: order.quote.productSku.name,
        metal: order.quote.productSku.metal,
        weightOz: order.quote.productSku.weightOz.toNumber(),
      },
      quantity: order.quote.quantity,
      supplier: order.quote.offer.supplier.name,
      shipping: order.deliveryType === 'DIRECT_SHIP' ? {
        name: order.shipName,
        address: order.shipAddress,
        city: order.shipCity,
        state: order.shipState,
        zip: order.shipZip,
        country: order.shipCountry,
      } : null,
      receipt: {
        spotUsd: order.receiptSpot.toNumber(),
        premiumUsd: order.receiptPremium.toNumber(),
        spreadUsd: order.receiptSpread.toNumber(),
        shippingUsd: order.receiptShipping.toNumber(),
        totalUsd: order.receiptTotal.toNumber(),
      },
      events: order.events.map((e) => ({
        id: e.id,
        stage: e.stage,
        note: e.note,
        createdAt: e.createdAt.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  async listOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        quote: {
          include: { productSku: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      deliveryType: order.deliveryType,
      product: {
        sku: order.quote.productSku.sku,
        name: order.quote.productSku.name,
        metal: order.quote.productSku.metal,
        weightOz: order.quote.productSku.weightOz.toNumber(),
      },
      quantity: order.quote.quantity,
      totalUsd: order.receiptTotal.toNumber(),
      createdAt: order.createdAt.toISOString(),
    }));
  }

  async advanceOrderStatus(orderId: string, newStatus: OrderStatus, note?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      await tx.orderEvent.create({
        data: {
          orderId,
          stage: newStatus,
          note: note || null,
        },
      });
    });
  }
}
