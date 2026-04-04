import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { KycStatus } from '@prisma/client';

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
    } else {
      this.logger.log(`KYC provider: ${this.provider}`);
    }
  }

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

    // Sumsub integration
    if (this.provider === 'sumsub' && this.apiKey) {
      try {
        const response = await fetch('https://api.sumsub.com/resources/accessTokens', {
          method: 'POST',
          headers: {
            'X-App-Token': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            levelName: 'basic-kyc-level',
          }),
        });
        const data = await response.json();
        return {
          id: `kyc_${Date.now()}`,
          userId,
          status: 'PENDING',
          provider: this.provider,
          externalId: data.token,
          verificationUrl: `https://websdk.sumsub.com/?accessToken=${data.token}`,
          createdAt: new Date().toISOString(),
        };
      } catch (error) {
        this.logger.error(`Sumsub API error: ${error}`);
      }
    }

    // Persona integration
    if (this.provider === 'persona' && this.apiKey) {
      try {
        const response = await fetch('https://withpersona.com/api/v1/inquiries', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Persona-Version': '2023-01-05',
          },
          body: JSON.stringify({
            data: {
              attributes: {
                'inquiry-template-id': this.apiSecret, // template ID stored in KYC_API_SECRET
                'reference-id': userId,
              },
            },
          }),
        });
        const data = await response.json();
        const inquiryId = data?.data?.id;
        return {
          id: `kyc_${Date.now()}`,
          userId,
          status: 'PENDING',
          provider: this.provider,
          externalId: inquiryId,
          verificationUrl: `https://withpersona.com/verify?inquiry-id=${inquiryId}`,
          createdAt: new Date().toISOString(),
        };
      } catch (error) {
        this.logger.error(`Persona API error: ${error}`);
      }
    }

    // Demo mode fallback
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

  async handleWebhook(payload: Record<string, unknown>): Promise<void> {
    this.logger.log(`KYC webhook received from ${this.provider}`);

    // Sumsub webhook
    if (this.provider === 'sumsub') {
      const externalUserId = payload.externalUserId as string;
      const reviewStatus = payload.reviewStatus as string;
      if (externalUserId) {
        const newStatus: KycStatus = reviewStatus === 'completed' ? 'VERIFIED' : 'REJECTED';
        await this.prisma.user.update({
          where: { id: externalUserId },
          data: { kycStatus: newStatus },
        });
        this.logger.log(`Sumsub: User ${externalUserId} KYC → ${newStatus}`);
      }
      return;
    }

    // Persona webhook
    if (this.provider === 'persona') {
      const attributes = (payload.data as Record<string, unknown>)?.attributes as Record<string, unknown>;
      const referenceId = attributes?.['reference-id'] as string;
      const status = attributes?.status as string;
      if (referenceId) {
        const newStatus: KycStatus = status === 'completed' ? 'VERIFIED' : 'REJECTED';
        await this.prisma.user.update({
          where: { id: referenceId },
          data: { kycStatus: newStatus },
        });
        this.logger.log(`Persona: User ${referenceId} KYC → ${newStatus}`);
      }
      return;
    }

    this.logger.log('KYC webhook received (demo mode — no action taken)');
  }

  async setKycStatus(userId: string, status: KycStatus): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: status },
    });
    this.logger.log(`KYC status updated for user ${userId}: ${status}`);
  }
}
