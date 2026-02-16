import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { TradeExecutionService } from './trade-execution.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, UserFromToken } from '../auth/decorators/current-user.decorator';

interface TradeDto {
  assetId: string;
  vaultId: string;
  quantity: number;
  currency: string;
}

interface TeleportDto {
  assetId: string;
  fromVaultId: string;
  toVaultId: string;
  quantity: number;
}

/**
 * Trade Execution Controller
 * 
 * All routes are protected with JWT authentication
 * User context is automatically extracted from token
 */
@Controller('trade')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class TradeExecutionController {
  constructor(
    private readonly tradeExecutionService: TradeExecutionService,
  ) {}

  @Post('buy')
  executeBuy(@CurrentUser() user: UserFromToken, @Body() dto: TradeDto) {
    // userId comes from authenticated user, not request body
    return this.tradeExecutionService.executeBuy({
      userId: user.authId,
      ...dto,
    });
  }

  @Post('sell')
  executeSell(@CurrentUser() user: UserFromToken, @Body() dto: TradeDto) {
    // userId comes from authenticated user, not request body
    return this.tradeExecutionService.executeSell({
      userId: user.authId,
      ...dto,
    });
  }

  @Post('teleport')
  executeTeleport(@CurrentUser() user: UserFromToken, @Body() dto: TeleportDto) {
    // userId comes from authenticated user, not request body
    return this.tradeExecutionService.executeTeleport({
      userId: user.authId,
      ...dto,
    });
  }

  @Get('holdings')
  getHoldings(@CurrentUser() user: UserFromToken) {
    // Users can only see their own holdings
    return this.tradeExecutionService.getHoldings(user.authId);
  }
}
