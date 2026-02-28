import { Test, TestingModule } from '@nestjs/testing';
import { TradeExecutionController } from '../trade-execution.controller';
import { TradeExecutionService } from '../trade-execution.service';
import { UserFromToken } from '../../auth/decorators/current-user.decorator';

const mockService = {
  executeBuy: jest.fn(),
  executeSell: jest.fn(),
  executeTeleport: jest.fn(),
  getHoldings: jest.fn(),
  getVaults: jest.fn(),
  getTransactions: jest.fn(),
};

const mockUser: UserFromToken = {
  authId: 'auth0|user1',
  email: 'test@example.com',
  permissions: ['trade:execute'],
};

describe('TradeExecutionController', () => {
  let controller: TradeExecutionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradeExecutionController],
      providers: [{ provide: TradeExecutionService, useValue: mockService }],
    }).compile();

    controller = module.get<TradeExecutionController>(TradeExecutionController);
    jest.clearAllMocks();
  });

  describe('POST /trade/buy', () => {
    it('should delegate to service.executeBuy with user authId', async () => {
      const dto = { assetId: 'a1', vaultId: 'v1', quantity: 1, currency: 'USD' };
      mockService.executeBuy.mockResolvedValue({ id: 'tx-1' });

      const result = await controller.executeBuy(mockUser, dto);

      expect(result).toEqual({ id: 'tx-1' });
      expect(mockService.executeBuy).toHaveBeenCalledWith('auth0|user1', dto);
    });
  });

  describe('POST /trade/sell', () => {
    it('should delegate to service.executeSell with user authId', async () => {
      const dto = { assetId: 'a1', vaultId: 'v1', quantity: 1, currency: 'USD' };
      mockService.executeSell.mockResolvedValue({ id: 'tx-2' });

      const result = await controller.executeSell(mockUser, dto);

      expect(result).toEqual({ id: 'tx-2' });
      expect(mockService.executeSell).toHaveBeenCalledWith('auth0|user1', dto);
    });
  });

  describe('POST /trade/teleport', () => {
    it('should delegate to service.executeTeleport with user authId', async () => {
      const dto = { assetId: 'a1', fromVaultId: 'v1', toVaultId: 'v2', quantity: 1 };
      mockService.executeTeleport.mockResolvedValue({ id: 'tx-3' });

      const result = await controller.executeTeleport(mockUser, dto);

      expect(result).toEqual({ id: 'tx-3' });
      expect(mockService.executeTeleport).toHaveBeenCalledWith('auth0|user1', dto);
    });
  });

  describe('GET /trade/holdings', () => {
    it('should delegate to service.getHoldings with user authId', async () => {
      mockService.getHoldings.mockResolvedValue([]);
      const result = await controller.getHoldings(mockUser);
      expect(result).toEqual([]);
      expect(mockService.getHoldings).toHaveBeenCalledWith('auth0|user1');
    });
  });

  describe('GET /trade/vaults', () => {
    it('should delegate to service.getVaults (public)', async () => {
      mockService.getVaults.mockResolvedValue([{ id: 'v1' }]);
      const result = await controller.getVaults();
      expect(result).toEqual([{ id: 'v1' }]);
    });
  });

  describe('GET /trade/transactions', () => {
    it('should parse limit and offset strings to integers', async () => {
      mockService.getTransactions.mockResolvedValue([]);

      await controller.getTransactions(mockUser, '10', '5');

      expect(mockService.getTransactions).toHaveBeenCalledWith('auth0|user1', {
        limit: 10,
        offset: 5,
      });
    });

    it('should pass undefined when no query params', async () => {
      mockService.getTransactions.mockResolvedValue([]);

      await controller.getTransactions(mockUser);

      expect(mockService.getTransactions).toHaveBeenCalledWith('auth0|user1', {
        limit: undefined,
        offset: undefined,
      });
    });
  });
});
