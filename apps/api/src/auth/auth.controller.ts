import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser, UserFromToken } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: UserFromToken) {
    return this.authService.getProfile(user);
  }

  @Post('verify-kyc')
  verifyKyc(@CurrentUser() user: UserFromToken) {
    return this.authService.verifyKyc(user.authId);
  }

  @Get('health')
  @Public()
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
