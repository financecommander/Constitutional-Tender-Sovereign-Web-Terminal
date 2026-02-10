import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile() {
    // TODO: Extract user ID from JWT/session
    return { message: 'Profile endpoint - requires authentication middleware' };
  }

  async verifyKyc(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'VERIFIED' },
    });
  }
}
