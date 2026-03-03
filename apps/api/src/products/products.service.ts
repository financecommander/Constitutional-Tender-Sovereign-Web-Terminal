import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Metal, ProductCategory } from '@prisma/client';
import { SpotService } from '../spot/spot.service';

export interface ProductWithOffers {
  id: string;
  sku: string;
  metal: Metal;
  name: string;
  weightOz: number;
  purity: number;
  category: ProductCategory;
  images: string[];
  eligibleDeliveryTypes: string[];
  flags: string[];
  isActive: boolean;
  bestOfferTotalUsd: number | null;
  bestOfferPremiumUsd: number | null;
  offerCount: number;
}

export interface OfferDetail {
  id: string;
  supplierId: string;
  supplierName: string;
  availableQty: number;
  shipEtaDays: number;
  shipOrigin: string;
  premiumUsd: number;
  constraints: string[];
  totalPerOzUsd: number;
  totalUnitUsd: number;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spotService: SpotService,
  ) {}

  async listProducts(
    metal?: Metal,
    category?: ProductCategory,
    options?: { search?: string; minWeight?: number; maxWeight?: number; sort?: string },
  ) {
    const where: any = { isActive: true };
    if (metal) where.metal = metal;
    if (category) where.category = category;
    if (options?.search) {
      where.name = { contains: options.search, mode: 'insensitive' };
    }
    if (options?.minWeight) {
      where.weightOz = { ...(where.weightOz || {}), gte: options.minWeight };
    }
    if (options?.maxWeight) {
      where.weightOz = { ...(where.weightOz || {}), lte: options.maxWeight };
    }

    // Sorting
    let orderBy: any[] = [{ metal: 'asc' }, { weightOz: 'asc' }];
    if (options?.sort === 'name') orderBy = [{ name: 'asc' }];
    else if (options?.sort === 'weight') orderBy = [{ weightOz: 'asc' }];
    else if (options?.sort === 'weight_desc') orderBy = [{ weightOz: 'desc' }];

    const products = await this.prisma.productSku.findMany({
      where,
      include: {
        offers: {
          where: { isActive: true },
          include: { supplier: true },
          orderBy: { premiumUsd: 'asc' },
        },
      },
      orderBy: [{ metal: 'asc' }, { weightOz: 'asc' }],
    });

    const spots = await this.spotService.getLatestSpots();
    const spotMap = new Map(spots.map((s) => [s.metal, s.spotUsdPerOz]));

    return products.map((p) => {
      const spotPerOz = spotMap.get(p.metal) || 0;
      const bestOffer = p.offers[0]; // sorted by premium asc

      const bestPremium = bestOffer ? bestOffer.premiumUsd.toNumber() : null;
      const bestTotal = bestPremium !== null
        ? (spotPerOz + bestPremium) * p.weightOz.toNumber()
        : null;

      return {
        id: p.id,
        sku: p.sku,
        metal: p.metal,
        name: p.name,
        weightOz: p.weightOz.toNumber(),
        purity: p.purity.toNumber(),
        category: p.category,
        images: p.images,
        eligibleDeliveryTypes: p.eligibleDeliveryTypes,
        flags: p.flags,
        isActive: p.isActive,
        bestOfferTotalUsd: bestTotal,
        bestOfferPremiumUsd: bestPremium,
        offerCount: p.offers.length,
      } as ProductWithOffers;
    });
  }

  async getProductBySku(sku: string) {
    const product = await this.prisma.productSku.findUnique({
      where: { sku },
      include: {
        offers: {
          where: { isActive: true },
          include: { supplier: true },
          orderBy: { premiumUsd: 'asc' },
        },
      },
    });

    if (!product) return null;

    const spots = await this.spotService.getLatestSpots();
    const spotPerOz = spots.find((s) => s.metal === product.metal)?.spotUsdPerOz || 0;

    const offers: OfferDetail[] = product.offers.map((o) => {
      const premium = o.premiumUsd.toNumber();
      const totalPerOz = spotPerOz + premium;
      const totalUnit = totalPerOz * product.weightOz.toNumber();

      return {
        id: o.id,
        supplierId: o.supplierId,
        supplierName: o.supplier.name,
        availableQty: o.availableQty,
        shipEtaDays: o.shipEtaDays,
        shipOrigin: o.shipOrigin,
        premiumUsd: premium,
        constraints: o.constraints,
        totalPerOzUsd: totalPerOz,
        totalUnitUsd: totalUnit,
      };
    });

    return {
      product: {
        id: product.id,
        sku: product.sku,
        metal: product.metal,
        name: product.name,
        weightOz: product.weightOz.toNumber(),
        purity: product.purity.toNumber(),
        category: product.category,
        images: product.images,
        eligibleDeliveryTypes: product.eligibleDeliveryTypes,
        flags: product.flags,
        isActive: product.isActive,
      },
      spotPerOz,
      offers,
    };
  }

  async getBestOffer(productSkuId: string): Promise<OfferDetail | null> {
    const offer = await this.prisma.supplierOffer.findFirst({
      where: { productSkuId, isActive: true },
      include: { supplier: true, productSku: true },
      orderBy: [{ premiumUsd: 'asc' }, { shipEtaDays: 'asc' }],
    });

    if (!offer) return null;

    const spots = await this.spotService.getLatestSpots();
    const spotPerOz = spots.find((s) => s.metal === offer.productSku.metal)?.spotUsdPerOz || 0;
    const premium = offer.premiumUsd.toNumber();

    return {
      id: offer.id,
      supplierId: offer.supplierId,
      supplierName: offer.supplier.name,
      availableQty: offer.availableQty,
      shipEtaDays: offer.shipEtaDays,
      shipOrigin: offer.shipOrigin,
      premiumUsd: premium,
      constraints: offer.constraints,
      totalPerOzUsd: spotPerOz + premium,
      totalUnitUsd: (spotPerOz + premium) * offer.productSku.weightOz.toNumber(),
    };
  }
}
