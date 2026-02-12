import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Auth Module
 * 
 * This module is module-scoped by design, allowing fine-grained control
 * over which routes require authentication. 
 * 
 * To make it globally available:
 * 1. Use APP_GUARD provider in AppModule to apply JwtAuthGuard globally
 * 2. Mark public routes with @Public() decorator
 * 
 * Benefits of module-scoped approach:
 * - More explicit control over protected routes
 * - Easier to debug authentication issues
 * - Better separation of concerns
 * - Simpler testing (can test modules without auth)
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, PassportModule],
})
export class AuthModule {}
