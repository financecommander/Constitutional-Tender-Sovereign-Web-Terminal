import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SpotService } from '../spot/spot.service';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { KycService } from '../kyc/kyc.service';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Metal, OrderStatus, KycStatus } from '@prisma/client';

/**
 * Admin Dashboard API
 *
 * Provides endpoints for internal administration:
 * - Dashboard stats (orders, users, revenue)
 * - Order management (view, advance status)
 * - User management (view, KYC override)
 * - Spot price overrides
 * - System health monitoring
 *
 * Requires 'admin:access' permission from Auth0 RBAC.
 */
@Controller('api/admin')
@RequirePermissions('admin:access')
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spotService: SpotService,
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
    private readonly kycService: KycService,
  ) {}

  // ==================
  // Dashboard Stats
  // ==================

  @Get('stats')
  async getDashboardStats() {
    const [userCount, orderCount, productCount, supplierCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.productSku.count({ where: { isActive: true } }),
      this.prisma.supplier.count({ where: { isActive: true } }),
    ]);

    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, fullName: true } },
        quote: { include: { productSku: true } },
      },
    });

    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalRevenue = await this.prisma.order.aggregate({
      _sum: { receiptTotal: true },
      where: { status: { in: ['DELIVERED', 'VAULT_ALLOCATED'] } },
    });

    return {
      overview: {
        totalUsers: userCount,
        totalOrders: orderCount,
        activeProducts: productCount,
        activeSuppliers: supplierCount,
        totalRevenue: totalRevenue._sum.receiptTotal?.toNumber() || 0,
      },
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        status: o.status,
        user: o.user?.email || 'Unknown',
        product: o.quote.productSku.name,
        total: o.receiptTotal.toNumber(),
        createdAt: o.createdAt.toISOString(),
      })),
      spotStatus: this.spotService.getStatus(),
    };
  }

  // ==================
  // Order Management
  // ==================

  @Get('orders')
  async listAllOrders(
    @Query('status') status?: OrderStatus,
    @Query('limit') limit?: string,
  ) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const orders = await this.prisma.order.findMany({
      where,
      take: parseInt(limit || '50'),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, fullName: true } },
        quote: {
          include: {
            productSku: true,
            offer: { include: { supplier: true } },
          },
        },
        events: { orderBy: { createdAt: 'asc' } },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      status: o.status,
      user: { email: o.user?.email, name: o.user?.fullName },
      product: {
        sku: o.quote.productSku.sku,
        name: o.quote.productSku.name,
        metal: o.quote.productSku.metal,
      },
      supplier: o.quote.offer.supplier.name,
      quantity: o.quote.quantity,
      deliveryType: o.deliveryType,
      paymentRail: o.paymentRail,
      receipt: {
        spot: o.receiptSpot.toNumber(),
        premium: o.receiptPremium.toNumber(),
        spread: o.receiptSpread.toNumber(),
        shipping: o.receiptShipping.toNumber(),
        total: o.receiptTotal.toNumber(),
      },
      shipping: o.deliveryType === 'DIRECT_SHIP' ? {
        name: o.shipName,
        address: o.shipAddress,
        city: o.shipCity,
        state: o.shipState,
        zip: o.shipZip,
        country: o.shipCountry,
      } : null,
      events: o.events.map((e) => ({
        stage: e.stage,
        note: e.note,
        createdAt: e.createdAt.toISOString(),
      })),
      createdAt: o.createdAt.toISOString(),
    }));
  }

  @Patch('orders/:orderId/status')
  async advanceOrderStatus(
    @Param('orderId') orderId: string,
    @Body() body: { status: OrderStatus; note?: string },
  ) {
    await this.ordersService.advanceOrderStatus(orderId, body.status, body.note);

    // Send notification based on status
    switch (body.status) {
      case 'FUNDS_CONFIRMED':
        await this.notificationsService.sendFundsConfirmed(orderId);
        break;
      case 'SHIPMENT_CREATED':
        await this.notificationsService.sendShipmentCreated(orderId);
        break;
      case 'DELIVERED':
      case 'VAULT_ALLOCATED':
        await this.notificationsService.sendOrderDelivered(orderId);
        break;
    }

    return { orderId, status: body.status, updated: true };
  }

  // ==================
  // User Management
  // ==================

  @Get('users')
  async listUsers(@Query('limit') limit?: string) {
    const users = await this.prisma.user.findMany({
      take: parseInt(limit || '50'),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        kycStatus: true,
        baseCurrency: true,
        createdAt: true,
        _count: { select: { orders: true, quotes: true } },
      },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      kycStatus: u.kycStatus,
      baseCurrency: u.baseCurrency,
      orderCount: u._count.orders,
      quoteCount: u._count.quotes,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  @Patch('users/:userId/kyc')
  async setKycStatus(
    @Param('userId') userId: string,
    @Body() body: { status: KycStatus },
  ) {
    await this.kycService.setKycStatus(userId, body.status);
    return { userId, kycStatus: body.status, updated: true };
  }

  // ==================
  // Spot Price Override
  // ==================

  @Post('spot/override')
  async overrideSpotPrice(
    @Body() body: { metal: Metal; spotUsdPerOz: number; changePct24h: number },
  ) {
    const result = await this.spotService.updateSpot(
      body.metal,
      body.spotUsdPerOz,
      body.changePct24h,
      'admin-override',
    );
    return result;
  }

  // ==================
  // System Health
  // ==================

  @Get('health')
  async getSystemHealth() {
    const dbHealthy = await this.checkDatabase();
    const spotStatus = this.spotService.getStatus();

    return {
      status: dbHealthy && !spotStatus.isStale ? 'healthy' : 'degraded',
      checks: {
        database: { status: dbHealthy ? 'up' : 'down' },
        spotFeed: {
          status: spotStatus.isStale ? 'stale' : 'live',
          lastUpdate: spotStatus.lastUpdate,
        },
        email: { provider: process.env.EMAIL_PROVIDER || 'console' },
        kyc: { provider: process.env.KYC_PROVIDER || 'demo' },
        payments: { stripe: !!process.env.STRIPE_SECRET_KEY },
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
