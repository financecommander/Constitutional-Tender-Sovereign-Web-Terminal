import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TradeExecutionService } from './trade-execution.service';

interface TradeDto {
  userId: string;
  assetId: string;
  vaultId: string;
  quantity: number;
  currency: string;
}

interface TeleportDto {
  userId: string;
  assetId: string;
  fromVaultId: string;
  toVaultId: string;
  quantity: number;
}

@Controller('trade')
export class TradeExecutionController {
  constructor(
    private readonly tradeExecutionService: TradeExecutionService,
  ) {}

  @Post('buy')
  executeBuy(@Body() dto: TradeDto) {
    return this.tradeExecutionService.executeBuy(dto);
  }

  @Post('sell')
  executeSell(@Body() dto: TradeDto) {
    return this.tradeExecutionService.executeSell(dto);
  }

  @Post('teleport')
  executeTeleport(@Body() dto: TeleportDto) {
    return this.tradeExecutionService.executeTeleport(dto);
  }

  @Get('holdings/:userId')
  getHoldings(@Param('userId') userId: string) {
    return this.tradeExecutionService.getHoldings(userId);
  }
}
