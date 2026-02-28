import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataService } from '../market-data.service';
import { PrismaService } from '../../prisma.service';

const mockPrisma = {
  asset: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('MarketDataService', () => {
  let service: MarketDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketDataService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MarketDataService>(MarketDataService);
    jest.clearAllMocks();
  });

  describe('getLivePrices', () => {
    it('should return active assets with price fields', async () => {
      const mockAssets = [
        {
          id: '1',
          name: '1oz Gold Bar',
          symbol: 'XAU-1OZ',
          metalType: 'GOLD',
          weightOz: 1,
          livePriceBid: 2650.0,
          livePriceAsk: 2680.0,
          spreadPercent: 1.13,
        },
      ];
      mockPrisma.asset.findMany.mockResolvedValue(mockAssets);

      const result = await service.getLivePrices();

      expect(result).toEqual(mockAssets);
      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          symbol: true,
          metalType: true,
          weightOz: true,
          livePriceBid: true,
          livePriceAsk: true,
          spreadPercent: true,
        },
      });
    });

    it('should return empty array when no active assets', async () => {
      mockPrisma.asset.findMany.mockResolvedValue([]);
      const result = await service.getLivePrices();
      expect(result).toEqual([]);
    });
  });

  describe('getAssetPrice', () => {
    it('should return price for a given symbol', async () => {
      const mockAsset = {
        id: '1',
        name: '1oz Gold Bar',
        symbol: 'XAU-1OZ',
        livePriceBid: 2650.0,
        livePriceAsk: 2680.0,
        spreadPercent: 1.13,
        updatedAt: new Date(),
      };
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset);

      const result = await service.getAssetPrice('XAU-1OZ');

      expect(result).toEqual(mockAsset);
      expect(mockPrisma.asset.findUnique).toHaveBeenCalledWith({
        where: { symbol: 'XAU-1OZ' },
        select: {
          id: true,
          name: true,
          symbol: true,
          livePriceBid: true,
          livePriceAsk: true,
          spreadPercent: true,
          updatedAt: true,
        },
      });
    });

    it('should return null for unknown symbol', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);
      const result = await service.getAssetPrice('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('getFxRates', () => {
    it('should return USD-based FX rates', async () => {
      const result = await service.getFxRates();

      expect(result.baseCurrency).toBe('USD');
      expect(result.rates).toHaveProperty('EUR');
      expect(result.rates).toHaveProperty('CHF');
      expect(result.rates).toHaveProperty('SGD');
      expect(result.rates).toHaveProperty('KYD');
      expect(result.rates).toHaveProperty('GBP');
      expect(result.updatedAt).toBeDefined();
    });
  });
});
