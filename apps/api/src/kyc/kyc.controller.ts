import { Controller, Get, Post, Req } from '@nestjs/common';
import { KycService } from './kyc.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('status')
  async getKycStatus(@Req() req: any) {
    const userId = req.user.dbUser.id;
    return this.kycService.getStatus(userId);
  }

  @Post('start')
  async startKyc(@Req() req: any) {
    const userId = req.user.dbUser.id;
    return this.kycService.startVerification(userId);
  }

  @Post('webhook')
  @Public()
  async handleWebhook(@Req() req: any) {
    await this.kycService.handleWebhook(req.body);
    return { received: true };
  }
}
