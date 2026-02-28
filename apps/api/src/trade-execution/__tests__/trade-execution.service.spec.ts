import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TradeExecutionService } from '../trade-execution.service';
import { PrismaService } from '../../prisma.service';

// Mock transaction client — captures all calls inside $transaction
const mockTxClient = {
  asset: { findUnique: jest.fn() },
  holding: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn() },
  transaction: { create: jest.fn() },
};

const mockPrisma = {
  $transaction: jest.fn((fn: (tx: typeof mockTxClient) => Promise<unknown>) =>
    fn(mockTxClient),
  ),
  holding: { findMany: jest.fn() },
  vault: { findMany: jest.fn() },
  transaction: { findMany: jest.fn() },
};

const MOCK_USER_ID = 'auth0|user123';

const mockAsset = {
  id: 'asset-1',
  name: '1oz Gold Bar',
  symbol: 'XAU-1OZ',
  isActive: true,
  livePriceAsk: { toNumber: () => 2680.0 },
  livePriceBid: { toNumber: () => 2650.0 },
};

const tradeDto = {
  assetId: 'asset-1',
  vaultId: 'vault-1',
  quantity: 2,
  currency: 'USD',
};

const teleportDto = {
  assetId: 'asset-1',
  fromVaultId: 'vault-1',
  toVaultId: 'vault-2',
  quantity: 1,
};

describe('TradeExecutionService', () => {
  let service: TradeExecutionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeExecutionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TradeExecutionService>(TradeExecutionService);
    jest.clearAllMocks();
  });

  // ── executeBuy ────────────────────────────────────────────

  describe('executeBuy', () => {
    it('should create a BUY transaction and upsert holding', async () => {
      mockTxClient.asset.findUnique.mockResolvedValue(mockAsset);
      mockTxClient.transaction.create.mockResolvedValue({ id: 'tx-1', type: 'BUY' });
      mockTxClient.holding.upsert.mockResolvedValue({});

      const result = await service.executeBuy(MOCK_USER_ID, tradeDto);

      expect(result).toEqual({ id: 'tx-1', type: 'BUY' });
      expect(mockTxClient.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: MOCK_USER_ID,
          type: 'BUY',
          status: 'COMPLETED',
          quantity: 2,
          totalAmount: 5360.0, // 2680 * 2
          toVaultId: 'vault-1',
        }),
      });
      expect(mockTxClient.holding.upsert).toHaveBeenCalled();
    });

    it('should throw NotFoundException when asset not found', async () => {
      mockTxClient.asset.findUnique.mockResolvedValue(null);
      await expect(service.executeBuy(MOCK_USER_ID, tradeDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when asset is inactive', async () => {
      mockTxClient.asset.findUnique.mockResolvedValue({ ...mockAsset, isActive: false });
      await expect(service.executeBuy(MOCK_USER_ID, tradeDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── executeSell ───────────────────────────────────────────

  describe('executeSell', () => {
    it('should create a SELL transaction and decrement holding', async () => {
      mockTxClient.asset.findUnique.mockResolvedValue(mockAsset);
      mockTxClient.holding.findUnique.mockResolvedValue({
        quantity: { toNumber: () => 10 },
      });
      mockTxClient.transaction.create.mockResolvedValue({ id: 'tx-2', type: 'SELL' });
      mockTxClient.holding.update.mockResolvedValue({});

      const result = await service.executeSell(MOCK_USER_ID, tradeDto);

      expect(result).toEqual({ id: 'tx-2', type: 'SELL' });
      expect(mockTxClient.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'SELL',
          totalAmount: 5300.0, // 2650 * 2
          fromVaultId: 'vault-1',
        }),
      });
    });

    it('should throw BadRequestException when insufficient holdings', async () => {
      mockTxClient.asset.findUnique.mockResolvedValue(mockAsset);
      mockTxClient.holding.findUnique.mockResolvedValue({
        quantity: { toNumber: () => 1 },
      });

      await expect(service.executeSell(MOCK_USER_ID, tradeDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when no holdings exist', async () => {
      mockTxClient.asset.findUnique.mockResolvedValue(mockAsset);
      mockTxClient.holding.findUnique.mockResolvedValue(null);

      await expect(service.executeSell(MOCK_USER_ID, tradeDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── executeTeleport ───────────────────────────────────────

  describe('executeTeleport', () => {
    it('should create a TELEPORT transaction and move holdings between vaults', async () => {
      mockTxClient.holding.findUnique.mockResolvedValue({
        quantity: { toNumber: () => 5 },
      });
      mockTxClient.transaction.create.mockResolvedValue({ id: 'tx-3', type: 'TELEPORT' });
      mockTxClient.holding.update.mockResolvedValue({});
      mockTxClient.holding.upsert.mockResolvedValue({});

      const result = await service.executeTeleport(MOCK_USER_ID, teleportDto);

      expect(result).toEqual({ id: 'tx-3', type: 'TELEPORT' });
      expect(mockTxClient.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'TELEPORT',
          pricePerUnit: 0,
          totalAmount: 0,
          fromVaultId: 'vault-1',
          toVaultId: 'vault-2',
        }),
      });
      // Source vault decrement
      expect(mockTxClient.holding.update).toHaveBeenCalled();
      // Destination vault upsert
      expect(mockTxClient.holding.upsert).toHaveBeenCalled();
    });

    it('should throw BadRequestException when insufficient holdings in source vault', async () => {
      mockTxClient.holding.findUnique.mockResolvedValue({
        quantity: { toNumber: () => 0.5 },
      });

      await expect(
        service.executeTeleport(MOCK_USER_ID, teleportDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── getHoldings ───────────────────────────────────────────

  describe('getHoldings', () => {
    it('should return holdings with asset and vault relations', async () => {
      const mockHoldings = [{ id: 'h-1', asset: {}, vault: {} }];
      mockPrisma.holding.findMany.mockResolvedValue(mockHoldings);

      const result = await service.getHoldings(MOCK_USER_ID);

      expect(result).toEqual(mockHoldings);
      expect(mockPrisma.holding.findMany).toHaveBeenCalledWith({
        where: { userId: MOCK_USER_ID },
        include: { asset: true, vault: true },
      });
    });
  });

  // ── getVaults ─────────────────────────────────────────────

  describe('getVaults', () => {
    it('should return active vaults sorted by name', async () => {
      const mockVaults = [{ id: 'v-1', name: 'Zurich' }];
      mockPrisma.vault.findMany.mockResolvedValue(mockVaults);

      const result = await service.getVaults();

      expect(result).toEqual(mockVaults);
      expect(mockPrisma.vault.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  // ── getTransactions ───────────────────────────────────────

  describe('getTransactions', () => {
    it('should return paginated transactions with defaults', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.getTransactions(MOCK_USER_ID);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: MOCK_USER_ID },
        include: { asset: true, fromVault: true, toVault: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
    });

    it('should respect custom limit and offset', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.getTransactions(MOCK_USER_ID, { limit: 10, offset: 5 });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 5 }),
      );
    });
  });
});
