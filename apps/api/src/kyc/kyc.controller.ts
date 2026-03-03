import { Controller, Get, Post, Req } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('api/kyc')
export class KycController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('status')
  async getKycStatus(@Req() req: any) {
    const userId = req.user.dbUser.id;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true, email: true, fullName: true },
    });

    return {
      status: user?.kycStatus || 'PENDING',
      canTrade: user?.kycStatus === 'VERIFIED',
      email: user?.email,
      fullName: user?.fullName,
    };
  }

  @Post('start')
  async startKyc(@Req() req: any) {
    const userId = req.user.dbUser.id;

    // In production, this would trigger an external KYC provider flow
    // For now, return the current status with instructions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });

    return {
      status: user?.kycStatus || 'PENDING',
      message: user?.kycStatus === 'VERIFIED'
        ? 'Your identity has already been verified.'
        : 'KYC verification will be available once connected to a verification provider.',
    };
  }
}
