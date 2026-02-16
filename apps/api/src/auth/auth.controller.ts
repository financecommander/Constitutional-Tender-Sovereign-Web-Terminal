import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser, UserFromToken } from './decorators/current-user.decorator';

/**
 * Auth Controller
 * 
 * Demonstrates proper usage of JWT authentication with Auth0
 * - Protected routes use @UseGuards(JwtAuthGuard)
 * - Public routes use @Public() decorator
 * - User context extracted with @CurrentUser() decorator
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get authenticated user's profile
   * This route is protected and requires a valid JWT
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: UserFromToken) {
    return this.authService.getProfile(user);
  }

  /**
   * Verify KYC for authenticated user
   * This route is protected and requires a valid JWT
   */
  @Post('verify-kyc')
  @UseGuards(JwtAuthGuard)
  verifyKyc(@CurrentUser() user: UserFromToken) {
    return this.authService.verifyKyc(user.authId);
  }

  /**
   * Health check endpoint - publicly accessible
   * Demonstrates use of @Public() decorator
   */
  @Get('health')
  @Public()
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
