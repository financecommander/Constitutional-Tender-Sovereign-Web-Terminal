import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma.service';
import { UserFromToken } from '../decorators/current-user.decorator';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    const tokenUser: UserFromToken = {
      authId: 'auth0|abc123',
      email: 'john@example.com',
      permissions: ['trade:execute'],
      metadata: { name: 'John Doe' },
    };

    it('should return existing user with permissions', async () => {
      const dbUser = {
        id: 'user-1',
        authId: 'auth0|abc123',
        email: 'john@example.com',
        fullName: 'John Doe',
        kycStatus: 'PENDING',
      };
      mockPrisma.user.findUnique.mockResolvedValue(dbUser);

      const result = await service.getProfile(tokenUser);

      expect(result).toEqual({
        ...dbUser,
        permissions: ['trade:execute'],
      });
    });

    it('should create new user on first login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const createdUser = {
        id: 'user-new',
        authId: 'auth0|abc123',
        email: 'john@example.com',
        fullName: 'John Doe',
      };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await service.getProfile(tokenUser);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          authId: 'auth0|abc123',
          email: 'john@example.com',
          fullName: 'John Doe',
        },
      });
      expect(result.permissions).toEqual(['trade:execute']);
    });

    it('should fall back to email prefix when no metadata name', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ fullName: 'john' });

      await service.getProfile({
        authId: 'auth0|abc123',
        email: 'john@example.com',
        permissions: [],
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ fullName: 'john' }),
      });
    });
  });

  describe('verifyKyc', () => {
    it('should update user KYC status to VERIFIED', async () => {
      const updatedUser = { kycStatus: 'VERIFIED' };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.verifyKyc('auth0|abc123');

      expect(result).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { authId: 'auth0|abc123' },
        data: { kycStatus: 'VERIFIED' },
      });
    });
  });
});
