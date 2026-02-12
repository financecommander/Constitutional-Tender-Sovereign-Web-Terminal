import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserFromToken } from './decorators/current-user.decorator';

/**
 * Auth Service
 * 
 * Handles authentication-related business logic
 * Demonstrates integration with user context from JWT
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user profile with authentication context
   * User is automatically fetched/created based on Auth0 ID
   * 
   * @param user - User context from JWT token
   */
  async getProfile(user: UserFromToken) {
    // Find or create user based on Auth0 ID
    let dbUser = await this.prisma.user.findUnique({
      where: { authId: user.authId },
    });

    // If user doesn't exist in DB, create them (first login)
    if (!dbUser && user.email) {
      // Try to extract full name from token metadata or email
      const fullName = user.metadata?.name || 
                      user.metadata?.fullName || 
                      user.email.split('@')[0];
      
      dbUser = await this.prisma.user.create({
        data: {
          authId: user.authId,
          email: user.email,
          fullName: fullName,
        },
      });
    }

    return {
      ...dbUser,
      permissions: user.permissions, // Include permissions from JWT for RBAC
    };
  }

  /**
   * Verify KYC status for a user
   * 
   * @param authId - Auth0 user ID from token
   */
  async verifyKyc(authId: string) {
    return this.prisma.user.update({
      where: { authId },
      data: { kycStatus: 'VERIFIED' },
    });
  }
}
