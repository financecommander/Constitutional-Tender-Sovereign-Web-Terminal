import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

/**
 * Suppliers Integration Service
 *
 * Manages supplier relationships, inventory syncing, and order routing.
 * Currently operates with seeded supplier data.
 *
 * To integrate real supplier APIs:
 * 1. Set SUPPLIER_API_KEYS in .env (JSON object: { "supplier_id": "api_key" })
 * 2. Implement supplier-specific adapters in suppliers/adapters/
 * 3. Enable inventory sync via SUPPLIER_SYNC_ENABLED=true
 *
 * Order routing logic:
 * - Best execution: lowest (premium + spread) per oz
 * - Tiebreaker: fastest shipping (shipEtaDays)
 * - Fallback: round-robin among equivalent offers
 */

export interface SupplierHealth {
  id: string;
  name: string;
  isActive: boolean;
  lastSync: string | null;
  offerCount: number;
  avgShipDays: number;
}

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);
  private readonly syncEnabled = process.env.SUPPLIER_SYNC_ENABLED === 'true';
  private lastSyncTimes: Map<string, Date> = new Map();

  constructor(private readonly prisma: PrismaService) {
    if (!this.syncEnabled) {
      this.logger.warn('SUPPLIER_SYNC_ENABLED not set — using seeded inventory data');
    }
  }

  /**
   * List all suppliers with health metrics
   */
  async listSuppliers(): Promise<SupplierHealth[]> {
    const suppliers = await this.prisma.supplier.findMany({
      include: {
        offers: {
          where: { isActive: true },
          select: { shipEtaDays: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      isActive: s.isActive,
      lastSync: this.lastSyncTimes.get(s.id)?.toISOString() || null,
      offerCount: s.offers.length,
      avgShipDays: s.offers.length > 0
        ? Math.round(s.offers.reduce((sum, o) => sum + o.shipEtaDays, 0) / s.offers.length)
        : 0,
    }));
  }

  /**
   * Get supplier details with all offers
   */
  async getSupplier(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        offers: {
          include: { productSku: true },
          orderBy: { premiumUsd: 'asc' },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier ${supplierId} not found`);
    }

    return {
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
      website: supplier.website,
      isActive: supplier.isActive,
      offers: supplier.offers.map((o) => ({
        id: o.id,
        productSku: o.productSku.sku,
        productName: o.productSku.name,
        metal: o.productSku.metal,
        availableQty: o.availableQty,
        shipEtaDays: o.shipEtaDays,
        shipOrigin: o.shipOrigin,
        premiumUsd: o.premiumUsd.toNumber(),
        constraints: o.constraints,
        isActive: o.isActive,
      })),
    };
  }

  /**
   * Toggle supplier active status
   */
  async toggleSupplier(supplierId: string, isActive: boolean) {
    const supplier = await this.prisma.supplier.update({
      where: { id: supplierId },
      data: { isActive },
    });

    // Also toggle all offers if deactivating
    if (!isActive) {
      await this.prisma.supplierOffer.updateMany({
        where: { supplierId },
        data: { isActive: false },
      });
    }

    this.logger.log(`Supplier ${supplier.name} ${isActive ? 'activated' : 'deactivated'}`);
    return { id: supplier.id, name: supplier.name, isActive: supplier.isActive };
  }

  /**
   * Update supplier offer inventory (admin or webhook)
   */
  async updateOfferInventory(offerId: string, availableQty: number, premiumUsd?: number) {
    const offer = await this.prisma.supplierOffer.update({
      where: { id: offerId },
      data: {
        availableQty,
        ...(premiumUsd !== undefined ? { premiumUsd } : {}),
      },
      include: { supplier: true, productSku: true },
    });

    this.lastSyncTimes.set(offer.supplierId, new Date());

    return {
      id: offer.id,
      supplier: offer.supplier.name,
      product: offer.productSku.sku,
      availableQty: offer.availableQty,
      premiumUsd: offer.premiumUsd.toNumber(),
    };
  }

  /**
   * Sync inventory from supplier API (placeholder)
   */
  async syncSupplierInventory(supplierId: string): Promise<{ synced: number }> {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException(`Supplier ${supplierId} not found`);

    // Real integration:
    // const apiKey = JSON.parse(process.env.SUPPLIER_API_KEYS || '{}')[supplierId];
    // const response = await fetch(`${supplier.apiUrl}/inventory`, {
    //   headers: { 'Authorization': `Bearer ${apiKey}` }
    // });
    // const inventory = await response.json();
    // for (const item of inventory) {
    //   await this.updateOfferInventory(item.offerId, item.qty, item.premium);
    // }

    this.lastSyncTimes.set(supplierId, new Date());
    this.logger.log(`Supplier ${supplier.name} sync completed (demo mode)`);

    return { synced: 0 };
  }
}
