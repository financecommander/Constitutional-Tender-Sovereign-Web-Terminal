import { Controller, Get, Param } from '@nestjs/common';
import { MarketDataService } from './market-data.service';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('prices')
  getLivePrices() {
    return this.marketDataService.getLivePrices();
  }

  @Get('prices/:symbol')
  getAssetPrice(@Param('symbol') symbol: string) {
    return this.marketDataService.getAssetPrice(symbol);
  }

  @Get('fx-rates')
  getFxRates() {
    return this.marketDataService.getFxRates();
  }
}
