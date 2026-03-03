import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DeliveryType, PaymentRail } from '@prisma/client';

@Injectable()
export class SavingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(
    userId: string,
    sku: string,
    amountUsd: number,
    frequencyDays: number,
    deliveryType: DeliveryType,
    paymentRail: PaymentRail,
  ) {
    if (amountUsd < 50) throw new BadRequestException('Minimum savings amount is $50');
    if (![7, 14, 30].includes(frequencyDays)) {
      throw new BadRequestException('Frequency must be 7 (weekly), 14 (biweekly), or 30 (monthly)');
    }

    const product = await this.prisma.productSku.findUnique({ where: { sku } });
    if (!product) throw new NotFoundException(`Product ${sku} not found`);

    const nextRunAt = new Date(Date.now() + frequencyDays * 24 * 60 * 60 * 1000);

    const plan = await this.prisma.savingsPlan.create({
      data: {
        userId,
        productSkuId: product.id,
        amountUsd,
        frequencyDays,
        deliveryType,
        paymentRail,
        nextRunAt,
      },
      include: { productSku: true },
    });

    return this.formatPlan(plan);
  }

  async getUserPlans(userId: string) {
    const plans = await this.prisma.savingsPlan.findMany({
      where: { userId },
      include: { productSku: true },
      orderBy: { createdAt: 'desc' },
    });
    return plans.map((p) => this.formatPlan(p));
  }

  async togglePlan(planId: string, userId: string) {
    const plan = await this.prisma.savingsPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const updated = await this.prisma.savingsPlan.update({
      where: { id: planId },
      data: { isActive: !plan.isActive },
      include: { productSku: true },
    });
    return this.formatPlan(updated);
  }

  async deletePlan(planId: string, userId: string) {
    const plan = await this.prisma.savingsPlan.findFirst({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundException('Plan not found');
    await this.prisma.savingsPlan.delete({ where: { id: planId } });
    return { deleted: true };
  }

  private formatPlan(plan: any) {
    const freqMap: Record<number, string> = { 7: 'Weekly', 14: 'Bi-weekly', 30: 'Monthly' };
    const freqLabel = freqMap[plan.frequencyDays as number] || `Every ${plan.frequencyDays} days`;
    return {
      id: plan.id,
      product: { sku: plan.productSku.sku, name: plan.productSku.name, metal: plan.productSku.metal },
      amountUsd: plan.amountUsd.toNumber(),
      frequency: freqLabel,
      frequencyDays: plan.frequencyDays,
      deliveryType: plan.deliveryType,
      paymentRail: plan.paymentRail,
      isActive: plan.isActive,
      nextRunAt: plan.nextRunAt.toISOString(),
      totalInvested: plan.totalInvested.toNumber(),
      totalOzBought: plan.totalOzBought.toNumber(),
      executionCount: plan.executionCount,
      createdAt: plan.createdAt.toISOString(),
    };
  }
}
