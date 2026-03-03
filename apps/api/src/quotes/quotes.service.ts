import { Injectable, BadRequestException, NotFoundException, GoneException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SpotService } from '../spot/spot.service';
import { DeliveryType } from '@prisma/client';

const QUOTE_TTL_MS = 5 * 60_000; // 5 minutes (industry standard: 3-10 min)
const SPREAD_USD_PER_OZ = 2.00; // platform spread
const SHIPPING_FLAT_USD = 15.00; // flat shipping fee

// Payment-method pricing: wire/ACH gets 4% discount (industry standard)
const PAYMENT_DISCOUNT: Record<string, number> = {
  WIRE: 0.04, // 4% off
  ACH: 0.04,  // 4% off
  CRYPTO: 0,  // no discount
};

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spotService: SpotService,
  ) {}

  async lockQuote(userId: string, sku: string, offerId: string, quantity: number, deliveryType: DeliveryType) {
    // Check staleness
    if (this.spotService.isStale()) {
      throw new ServiceUnavailableException('PRICING_STALE');
    }

    // Find product
    const product = await this.prisma.productSku.findUnique({ where: { sku } });
    if (!product) {
      throw new NotFoundException(`Product ${sku} not found`);
    }

    // Find offer
    const offer = await this.prisma.supplierOffer.findFirst({
      where: { id: offerId, productSkuId: product.id, isActive: true },
    });
    if (!offer) {
      throw new NotFoundException(`Offer ${offerId} not found or inactive`);
    }

    // Check quantity
    if (quantity > offer.availableQty) {
      throw new BadRequestException(`Requested ${quantity} but only ${offer.availableQty} available`);
    }

    // Get live spot
    const spots = await this.spotService.getLatestSpots();
    const metalSpot = spots.find((s) => s.metal === product.metal);
    if (!metalSpot) {
      throw new ServiceUnavailableException('No spot price available for this metal');
    }

    const spotUsd = metalSpot.spotUsdPerOz;
    const premiumUsd = offer.premiumUsd.toNumber();
    const spreadUsd = SPREAD_USD_PER_OZ;
    const shippingUsd = deliveryType === 'DIRECT_SHIP' ? SHIPPING_FLAT_USD : 0;

    const unitPrice = (spotUsd + premiumUsd + spreadUsd) * product.weightOz.toNumber();
    const totalUsd = unitPrice * quantity + shippingUsd;

    const expiresAt = new Date(Date.now() + QUOTE_TTL_MS);

    const quote = await this.prisma.quote.create({
      data: {
        userId,
        productSkuId: product.id,
        offerId: offer.id,
        quantity,
        lockedSpot: spotUsd,
        lockedPremium: premiumUsd,
        lockedSpread: spreadUsd,
        lockedShipping: shippingUsd,
        totalUsd,
        deliveryType,
        expiresAt,
      },
      include: {
        productSku: true,
        offer: { include: { supplier: true } },
      },
    });

    // Calculate payment-method pricing
    const baseTotal = quote.totalUsd.toNumber();
    const paymentPricing = {
      WIRE: Math.round((baseTotal * (1 - PAYMENT_DISCOUNT.WIRE)) * 100) / 100,
      ACH: Math.round((baseTotal * (1 - PAYMENT_DISCOUNT.ACH)) * 100) / 100,
      CRYPTO: baseTotal,
    };

    return {
      id: quote.id,
      sku: product.sku,
      productName: product.name,
      metal: product.metal,
      weightOz: product.weightOz.toNumber(),
      quantity: quote.quantity,
      lockedSpotUsd: spotUsd,
      lockedPremiumUsd: premiumUsd,
      lockedSpreadUsd: spreadUsd,
      lockedShippingUsd: shippingUsd,
      totalUsd: baseTotal,
      paymentPricing,
      deliveryType: quote.deliveryType,
      supplierName: quote.offer.supplier.name,
      shipEtaDays: quote.offer.shipEtaDays,
      expiresAt: quote.expiresAt.toISOString(),
      createdAt: quote.createdAt.toISOString(),
    };
  }

  async getQuote(quoteId: string, userId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, userId },
      include: {
        productSku: true,
        offer: { include: { supplier: true } },
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }

    const isExpired = new Date() > quote.expiresAt;

    return {
      id: quote.id,
      sku: quote.productSku.sku,
      productName: quote.productSku.name,
      metal: quote.productSku.metal,
      weightOz: quote.productSku.weightOz.toNumber(),
      quantity: quote.quantity,
      lockedSpotUsd: quote.lockedSpot.toNumber(),
      lockedPremiumUsd: quote.lockedPremium.toNumber(),
      lockedSpreadUsd: quote.lockedSpread.toNumber(),
      lockedShippingUsd: quote.lockedShipping.toNumber(),
      totalUsd: quote.totalUsd.toNumber(),
      deliveryType: quote.deliveryType,
      supplierName: quote.offer.supplier.name,
      shipEtaDays: quote.offer.shipEtaDays,
      expiresAt: quote.expiresAt.toISOString(),
      isExpired,
      isUsed: quote.isUsed,
      createdAt: quote.createdAt.toISOString(),
    };
  }

  async validateQuoteForOrder(quoteId: string, userId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, userId },
    });

    if (!quote) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }

    if (quote.isUsed) {
      throw new BadRequestException('Quote has already been used');
    }

    if (new Date() > quote.expiresAt) {
      throw new GoneException('QUOTE_EXPIRED');
    }

    return quote;
  }

  async markQuoteUsed(quoteId: string) {
    await this.prisma.quote.update({
      where: { id: quoteId },
      data: { isUsed: true },
    });
  }
}
