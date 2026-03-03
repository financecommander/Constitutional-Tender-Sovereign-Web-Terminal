import { Controller, Get, Post, Patch, Delete, Param, Body, UnauthorizedException } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { CurrentUser, UserFromToken } from '../auth/decorators/current-user.decorator';

@Controller('api/savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Get()
  async getPlans(@CurrentUser() user: UserFromToken) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.savingsService.getUserPlans(user.dbUserId);
  }

  @Post()
  async createPlan(
    @CurrentUser() user: UserFromToken,
    @Body() body: {
      sku: string;
      amountUsd: number;
      frequencyDays: number;
      deliveryType: 'DIRECT_SHIP' | 'VAULT_ALLOCATE';
      paymentRail: 'WIRE' | 'ACH' | 'CRYPTO';
    },
  ) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.savingsService.createPlan(
      user.dbUserId, body.sku, body.amountUsd, body.frequencyDays, body.deliveryType, body.paymentRail,
    );
  }

  @Patch(':planId/toggle')
  async togglePlan(@CurrentUser() user: UserFromToken, @Param('planId') planId: string) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.savingsService.togglePlan(planId, user.dbUserId);
  }

  @Delete(':planId')
  async deletePlan(@CurrentUser() user: UserFromToken, @Param('planId') planId: string) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.savingsService.deletePlan(planId, user.dbUserId);
  }
}
