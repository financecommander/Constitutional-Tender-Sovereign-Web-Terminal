import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { KycStatus } from '@prisma/client';

/**
 * KYC Provider Integration Service
 *
 * Handles identity verification for regulatory compliance.
 * Currently operates in demo mode.
 *
 * To integrate a real KYC provider:
 * 1. Set KYC_PROVIDER in .env (sumsub | jumio | persona | onfido)
 * 2. Set KYC_API_KEY in .env
 * 3. Set KYC_API_SECRET in .env
 * 4. Set KYC_WEBHOOK_SECRET in .env
 * 5. Uncomment the provider-specific integration below
 *
 * Supported providers:
 * - Sumsub (sumsub.com)
 * - Jumio (jumio.com)
 * - Persona (withpersona.com)
 * - Onfido (onfido.com)
 */

export interface KycVerification {
  id: string;
  userId: string;
  status: KycStatus;
  provider: string;
  externalId?: string;
  verificationUrl?: string;
  completedAt?: string;
  createdAt: string;
}

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  private readonly provider = process.env.KYC_PROVIDER || 'demo';
  private readonly apiKey = process.env.KYC_API_KEY || '';
  private readonly apiSecret = process.env.KYC_API_SECRET || '';

  constructor(private readonly prisma: PrismaService) {
    if (this.provider === 'demo') {
      this.logger.warn('KYC_PROVIDER not set — running in demo mode');
    }
  }

  /**
   * Get current KYC status for a user
   */
  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true, email: true, fullName: true },
    });

    return {
      status: user?.kycStatus || 'PENDING',
      canTrade: user?.kycStatus === 'VERIFIED',
      email: user?.email,
      fullName: user?.fullName,
      provider: this.provider,
    };
  }

  /**
   * Initiate KYC verification
   * Returns a verification URL for the user to complete
   */
  async startVerification(userId: string): Promise<KycVerification> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true, email: true, fullName: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.kycStatus === 'VERIFIED') {
      return {
        id: `kyc_${Date.now()}`,
        userId,
        status: 'VERIFIED',
        provider: this.provider,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    }

    // Real provider integration (placeholder)
    // if (this.provider === 'sumsub' && this.apiKey) {
    //   const response = await fetch('https://api.sumsub.com/resources/accessTokens', {
    //     method: 'POST',
    //     headers: {
    //       'X-App-Token': this.apiKey,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       userId: userId,
    //       levelName: 'basic-kyc-level',
    //     }),
    //   });
    //   const data = await response.json();
    //   return {
    //     id: `kyc_${Date.now()}`,
    //     userId,
    //     status: 'PENDING',
    //     provider: this.provider,
    //     externalId: data.token,
    //     verificationUrl: `https://websdk.sumsub.com/?accessToken=${data.token}`,
    //     createdAt: new Date().toISOString(),
    //   };
    // }

    // Demo mode: set user to PENDING and provide mock URL
    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' },
    });

    this.logger.log(`KYC verification initiated for user ${userId} (demo mode)`);

    return {
      id: `kyc_${Date.now()}`,
      userId,
      status: 'PENDING',
      provider: 'demo',
      verificationUrl: '/app/profile?kyc=pending',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Handle webhook from KYC provider
   */
  async handleWebhook(payload: any): Promise<void> {
    this.logger.log('KYC webhook received (provider integration pending)');

    // Real provider webhook handling:
    // const { userId, status, externalId } = this.parseWebhook(payload);
    // await this.prisma.user.update({
    //   where: { id: userId },
    //   data: { kycStatus: status === 'approved' ? 'VERIFIED' : 'REJECTED' },
    // });
  }

  /**
   * Admin: manually set KYC status
   */
  async setKycStatus(userId: string, status: KycStatus): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: status },
    });
    this.logger.log(`KYC status updated for user ${userId}: ${status}`);
  }
}
