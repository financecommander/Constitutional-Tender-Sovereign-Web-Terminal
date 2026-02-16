import { Controller, Get, Param } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Market Data Controller
 * 
 * Market data is publicly accessible (no authentication required)
 * Uses @Public() decorator to allow unauthenticated access
 */
@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('prices')
  @Public() // Public endpoint - no authentication required
  getLivePrices() {
    return this.marketDataService.getLivePrices();
  }

  @Get('prices/:symbol')
  @Public() // Public endpoint - no authentication required
  getAssetPrice(@Param('symbol') symbol: string) {
    return this.marketDataService.getAssetPrice(symbol);
  }

  @Get('fx-rates')
  @Public() // Public endpoint - no authentication required
  getFxRates() {
    return this.marketDataService.getFxRates();
  }
}
