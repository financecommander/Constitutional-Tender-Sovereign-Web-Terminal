import { Controller, Post, Body, Get } from '@nestjs/common';
import { TradeExecutionService } from './trade-execution.service';
import { CurrentUser, UserFromToken } from '../auth/decorators/current-user.decorator';
import { CreateTradeDto } from './dto/create-trade.dto';
import { CreateTeleportDto } from './dto/create-teleport.dto';

@Controller('trade')
export class TradeExecutionController {
  constructor(
    private readonly tradeExecutionService: TradeExecutionService,
  ) {}

  @Post('buy')
  executeBuy(@CurrentUser() user: UserFromToken, @Body() dto: CreateTradeDto) {
    return this.tradeExecutionService.executeBuy(user.authId, dto);
  }

  @Post('sell')
  executeSell(@CurrentUser() user: UserFromToken, @Body() dto: CreateTradeDto) {
    return this.tradeExecutionService.executeSell(user.authId, dto);
  }

  @Post('teleport')
  executeTeleport(@CurrentUser() user: UserFromToken, @Body() dto: CreateTeleportDto) {
    return this.tradeExecutionService.executeTeleport(user.authId, dto);
  }

  @Get('holdings')
  getHoldings(@CurrentUser() user: UserFromToken) {
    return this.tradeExecutionService.getHoldings(user.authId);
  }
}
