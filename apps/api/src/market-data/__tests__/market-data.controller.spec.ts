import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataController } from '../market-data.controller';
import { MarketDataService } from '../market-data.service';

const mockService = {
  getLivePrices: jest.fn(),
  getAssetPrice: jest.fn(),
  getFxRates: jest.fn(),
};

describe('MarketDataController', () => {
  let controller: MarketDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketDataController],
      providers: [{ provide: MarketDataService, useValue: mockService }],
    }).compile();

    controller = module.get<MarketDataController>(MarketDataController);
    jest.clearAllMocks();
  });

  describe('GET /market-data/prices', () => {
    it('should delegate to service.getLivePrices', async () => {
      const prices = [{ symbol: 'XAU-1OZ', livePriceBid: 2650 }];
      mockService.getLivePrices.mockResolvedValue(prices);

      const result = await controller.getLivePrices();

      expect(result).toEqual(prices);
      expect(mockService.getLivePrices).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /market-data/prices/:symbol', () => {
    it('should delegate to service.getAssetPrice with symbol', async () => {
      const price = { symbol: 'XAU-1OZ', livePriceBid: 2650 };
      mockService.getAssetPrice.mockResolvedValue(price);

      const result = await controller.getAssetPrice('XAU-1OZ');

      expect(result).toEqual(price);
      expect(mockService.getAssetPrice).toHaveBeenCalledWith('XAU-1OZ');
    });
  });

  describe('GET /market-data/fx-rates', () => {
    it('should delegate to service.getFxRates', async () => {
      const rates = { baseCurrency: 'USD', rates: { EUR: 0.92 } };
      mockService.getFxRates.mockResolvedValue(rates);

      const result = await controller.getFxRates();

      expect(result).toEqual(rates);
    });
  });
});
