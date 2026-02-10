import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  getProfile() {
    return this.authService.getProfile();
  }

  @Post('verify-kyc')
  verifyKyc(@Body() body: { userId: string }) {
    return this.authService.verifyKyc(body.userId);
  }
}
