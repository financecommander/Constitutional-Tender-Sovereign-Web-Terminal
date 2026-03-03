import { Controller, Get, Post, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Get()
  async getPlans(@Req() req: any) {
    const userId = req.user.dbUser.id;
    return this.savingsService.getUserPlans(userId);
  }

  @Post()
  async createPlan(
    @Req() req: any,
    @Body() body: {
      sku: string;
      amountUsd: number;
      frequencyDays: number;
      deliveryType: 'DIRECT_SHIP' | 'VAULT_ALLOCATE';
      paymentRail: 'WIRE' | 'ACH' | 'CRYPTO';
    },
  ) {
    const userId = req.user.dbUser.id;
    return this.savingsService.createPlan(
      userId, body.sku, body.amountUsd, body.frequencyDays, body.deliveryType, body.paymentRail,
    );
  }

  @Patch(':planId/toggle')
  async togglePlan(@Req() req: any, @Param('planId') planId: string) {
    const userId = req.user.dbUser.id;
    return this.savingsService.togglePlan(planId, userId);
  }

  @Delete(':planId')
  async deletePlan(@Req() req: any, @Param('planId') planId: string) {
    const userId = req.user.dbUser.id;
    return this.savingsService.deletePlan(planId, userId);
  }
}
