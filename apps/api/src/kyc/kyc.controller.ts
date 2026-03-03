import {
  Controller,
  Get,
  Post,
  Headers,
  Body,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, UserFromToken } from '../auth/decorators/current-user.decorator';
import * as crypto from 'crypto';

@Controller('api/kyc')
export class KycController {
  private readonly logger = new Logger(KycController.name);

  constructor(private readonly kycService: KycService) {}

  @Get('status')
  async getKycStatus(@CurrentUser() user: UserFromToken) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.kycService.getStatus(user.dbUserId);
  }

  @Post('start')
  async startKyc(@CurrentUser() user: UserFromToken) {
    if (!user.dbUserId) {
      throw new UnauthorizedException('User profile not found. Please complete onboarding first.');
    }
    return this.kycService.startVerification(user.dbUserId);
  }

  @Post('webhook')
  @Public()
  async handleWebhook(
    @Headers('x-webhook-signature') signature: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.KYC_WEBHOOK_SECRET;
    if (webhookSecret) {
      if (!signature) {
        this.logger.warn('KYC webhook received without signature');
        throw new ForbiddenException('Missing webhook signature');
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        this.logger.warn('KYC webhook signature mismatch');
        throw new ForbiddenException('Invalid webhook signature');
      }
    } else {
      this.logger.warn(
        'KYC_WEBHOOK_SECRET not configured — webhook signature verification skipped',
      );
    }

    await this.kycService.handleWebhook(body);
    return { received: true };
  }
}
