/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { PoliciesService } from './policies.service';
import { Policy, PendingPolicy, User } from '../../models';
import { ActivatePendingPolicyDto } from '../../dto/pending-policy.dto';
import { PolicyFilterDto } from '../../dto/policy.dto';

describe('PoliciesService', () => {
  let service: PoliciesService;
  let policyModel: typeof Policy;
  let pendingPolicyModel: typeof PendingPolicy;
  let userModel: typeof User;
  let mockTransaction: any;

  const mockPolicy = {
    id: 1,
    policyNumber: 'POL-TES-1234567890-ABC123',
    userId: 1,
    planId: 1,
    policyTypeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
    },
    product: {
      id: 1,
      name: 'Test Insurance',
      price: 100,
      category: {
        name: 'Health',
      },
    },
  };

  const mockPendingPolicy = {
    id: 1,
    planId: 1,
    status: 'unused',
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
    destroy: jest.fn(),
    plan: {
      id: 1,
      userId: 1,
      productId: 1,
      user: {
        id: 1,
        fullName: 'John Doe',
      },
      product: {
        id: 1,
        name: 'Test Insurance',
        price: 100,
        category: {
          name: 'Health',
        },
      },
    },
  };

  const mockUser = {
    id: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(async () => {
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    const mockSequelize = {
      transaction: jest.fn().mockImplementation((callback) => {
        return callback(mockTransaction);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesService,
        {
          provide: getModelToken(Policy),
          useValue: {
            findByPk: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            sequelize: mockSequelize,
          },
        },
        {
          provide: getModelToken(PendingPolicy),
          useValue: {
            findByPk: jest.fn(),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findByPk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PoliciesService>(PoliciesService);
    policyModel = module.get<typeof Policy>(getModelToken(Policy));
    pendingPolicyModel = module.get<typeof PendingPolicy>(
      getModelToken(PendingPolicy),
    );
    userModel = module.get<typeof User>(getModelToken(User));

    // Mock logger methods
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('activatePendingPolicy', () => {
    const activateDto: ActivatePendingPolicyDto = {
      pendingPolicyId: 1,
      userId: 2,
    };

    it('should successfully activate a pending policy', async () => {
      const mockCreatedPolicy = {
        id: 1,
        policyNumber: 'POL-TES-1234567890-ABC123',
        userId: 2,
        planId: 1,
        policyTypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(pendingPolicyModel, 'findByPk')
        .mockResolvedValue(mockPendingPolicy as any);
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);
      jest.spyOn(policyModel, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(policyModel, 'create')
        .mockResolvedValue(mockCreatedPolicy as any);
      jest
        .spyOn(mockPendingPolicy, 'update')
        .mockResolvedValue(mockPendingPolicy);
      jest.spyOn(mockPendingPolicy, 'destroy').mockResolvedValue(undefined);

      const result = await service.activatePendingPolicy(activateDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('policyNumber');
      expect(result.userId).toBe(2);
      expect(result.product.name).toBe('Test Insurance');
      expect(pendingPolicyModel.findByPk).toHaveBeenCalledWith(
        1,
        expect.any(Object),
      );
      expect(userModel.findByPk).toHaveBeenCalledWith(2, expect.any(Object));
      expect(policyModel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when pending policy not found', async () => {
      jest.spyOn(pendingPolicyModel, 'findByPk').mockResolvedValue(null);

      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(pendingPolicyModel.findByPk).toHaveBeenCalledWith(
        1,
        expect.any(Object),
      );
    });

    it('should throw BadRequestException when pending policy is already used', async () => {
      const usedPendingPolicy = { ...mockPendingPolicy, status: 'used' };
      jest
        .spyOn(pendingPolicyModel, 'findByPk')
        .mockResolvedValue(usedPendingPolicy as any);

      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when user not found', async () => {
      jest
        .spyOn(pendingPolicyModel, 'findByPk')
        .mockResolvedValue(mockPendingPolicy as any);
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(null);

      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when user already has policy for plan', async () => {
      const existingPolicy = { id: 2, userId: 2, policyTypeId: 1 };
      jest
        .spyOn(pendingPolicyModel, 'findByPk')
        .mockResolvedValue(mockPendingPolicy as any);
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);
      jest
        .spyOn(policyModel, 'findOne')
        .mockResolvedValue(existingPolicy as any);

      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should use plan user when userId is not provided', async () => {
      const activateDtoWithoutUserId = { pendingPolicyId: 1 };
      const mockCreatedPolicy = {
        id: 1,
        policyNumber: 'POL-TES-1234567890-ABC123',
        userId: 1,
        planId: 1,
        policyTypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(pendingPolicyModel, 'findByPk')
        .mockResolvedValue(mockPendingPolicy as any);
      jest.spyOn(policyModel, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(policyModel, 'create')
        .mockResolvedValue(mockCreatedPolicy as any);

      const result = await service.activatePendingPolicy(
        activateDtoWithoutUserId,
      );

      expect(result.userId).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all policies without filters', async () => {
      const mockPolicies = [mockPolicy];
      jest.spyOn(policyModel, 'findAll').mockResolvedValue(mockPolicies as any);

      const result = await service.findAll();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            policyNumber: 'POL-TES-1234567890-ABC123',
            userId: 1,
            planId: 1,
          }),
        ]),
      );
      expect(policyModel.findAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        order: [['createdAt', 'DESC']],
        nest: true,
        raw: true,
      });
    });

    it('should return filtered policies by planId', async () => {
      const filters: PolicyFilterDto = { planId: 1 };
      const mockPolicies = [mockPolicy];
      jest.spyOn(policyModel, 'findAll').mockResolvedValue(mockPolicies as any);

      const result = await service.findAll(filters);

      expect(result).toHaveLength(1);
      expect(policyModel.findAll).toHaveBeenCalledWith({
        where: { planId: 1 },
        include: expect.any(Array),
        order: [['createdAt', 'DESC']],
        nest: true,
        raw: true,
      });
    });

    it('should handle empty results', async () => {
      jest.spyOn(policyModel, 'findAll').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      jest
        .spyOn(policyModel, 'findAll')
        .mockRejectedValue(new Error('DB Error'));

      await expect(service.findAll()).rejects.toThrow('DB Error');
    });
  });

  describe('findById', () => {
    it('should return policy by id', async () => {
      jest.spyOn(policyModel, 'findByPk').mockResolvedValue(mockPolicy as any);

      const result = await service.findById(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          policyNumber: 'POL-TES-1234567890-ABC123',
          userId: 1,
          planId: 1,
        }),
      );
      expect(policyModel.findByPk).toHaveBeenCalledWith(1, {
        include: expect.any(Array),
      });
    });

    it('should return null when policy not found', async () => {
      jest.spyOn(policyModel, 'findByPk').mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
      expect(policyModel.findByPk).toHaveBeenCalledWith(999, {
        include: expect.any(Array),
      });
    });

    it('should handle database errors', async () => {
      jest
        .spyOn(policyModel, 'findByPk')
        .mockRejectedValue(new Error('DB Error'));

      await expect(service.findById(1)).rejects.toThrow('DB Error');
    });
  });

  describe('generatePolicyNumber', () => {
    it('should generate a policy number with correct format', () => {
      const productName = 'Test Insurance';
      const policyNumber = (service as any).generatePolicyNumber(productName);

      expect(policyNumber).toMatch(/^POL-TES-\d+-[A-Z0-9]{6}$/);
      expect(policyNumber).toContain('POL-TES-');
    });

    it('should handle short product names', () => {
      const productName = 'AB';
      const policyNumber = (service as any).generatePolicyNumber(productName);

      expect(policyNumber).toMatch(/^POL-AB-\d+-[A-Z0-9]{6}$/);
    });
  });
});
