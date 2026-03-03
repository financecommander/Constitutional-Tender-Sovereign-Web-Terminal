import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UserFromToken } from '../decorators/current-user.decorator';

const mockService = {
  getProfile: jest.fn(),
  verifyKyc: jest.fn(),
};

const mockUser: UserFromToken = {
  authId: 'auth0|user1',
  email: 'test@example.com',
  permissions: ['trade:execute'],
  dbUserId: null,
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('GET /auth/profile', () => {
    it('should delegate to service.getProfile', async () => {
      const profile = { fullName: 'John', permissions: ['trade:execute'] };
      mockService.getProfile.mockResolvedValue(profile);

      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(profile);
      expect(mockService.getProfile).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('POST /auth/verify-kyc', () => {
    it('should delegate to service.verifyKyc with authId', async () => {
      mockService.verifyKyc.mockResolvedValue({ kycStatus: 'VERIFIED' });

      const result = await controller.verifyKyc(mockUser);

      expect(result).toEqual({ kycStatus: 'VERIFIED' });
      expect(mockService.verifyKyc).toHaveBeenCalledWith('auth0|user1');
    });
  });

  describe('GET /auth/health', () => {
    it('should return ok status', () => {
      const result = controller.healthCheck();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });
  });
});
