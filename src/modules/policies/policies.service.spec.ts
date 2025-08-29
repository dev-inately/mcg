import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { BadRequestException } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { Policy } from '../../models/policy.model';
import { PendingPolicy } from '../../models/pending-policy.model';
import { User } from '../../models/user.model';
import { Plan } from '../../models/plan.model';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';

describe('PoliciesService', () => {
  let service: PoliciesService;
  let policyModel: any;
  let pendingPolicyModel: any;
  let userModel: any;

  const mockUser = {
    id: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
  };

  const mockProductCategory = {
    id: 1,
    name: 'Health Insurance',
  };

  const mockProduct = {
    id: 1,
    name: 'Optimal Care Mini',
    price: 10000.0,
    category: mockProductCategory,
  };

  const mockPlan = {
    id: 1,
    userId: 1,
    productId: 1,
    user: mockUser,
    product: mockProduct,
  };

  const mockPendingPolicy = {
    id: 1,
    status: 'unused',
    planId: 1,
    plan: mockPlan,
    update: jest.fn(),
  };

  const mockPolicy = {
    id: 1,
    policyNumber: 'POL-OPT-1234567890-ABC123',
    userId: 1,
    planId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    product: mockProduct,
  };

  const mockPendingPolicyWithNestedData = {
    id: 1,
    status: 'unused',
    planId: 1,
    plan: mockPlan,
    update: jest.fn(),
  };

  const mockPolicyWithNestedData = {
    id: 1,
    policyNumber: 'POL-OPT-1234567890-ABC123',
    userId: 1,
    planId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    product: mockProduct,
  };

  const mockPolicyWithNestedDataForFindAll = {
    id: 1,
    policyNumber: 'POL-OPT-1234567890-ABC123',
    userId: 1,
    planId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    product: mockProduct,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesService,
        {
          provide: getModelToken(Policy),
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByPk: jest.fn(),
            findOne: jest.fn(),
            sequelize: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getModelToken(PendingPolicy),
          useValue: {
            findByPk: jest.fn(),
            update: jest.fn(),
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
    policyModel = module.get(getModelToken(Policy));
    pendingPolicyModel = module.get(getModelToken(PendingPolicy));
    userModel = module.get(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('activatePendingPolicy', () => {
    it('should activate a pending policy successfully', async () => {
      const activateDto = { pendingPolicyId: 1, userId: undefined };
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTransactionObj = { id: 'mock-transaction' };
        return await callback(mockTransactionObj);
      });

      const mockPendingPolicyWithUpdate = {
        ...mockPendingPolicy,
        update: jest.fn().mockResolvedValue([1]),
      };

      pendingPolicyModel.findByPk.mockResolvedValue(
        mockPendingPolicyWithUpdate,
      );
      policyModel.findOne.mockResolvedValue(null);
      policyModel.sequelize.transaction.mockImplementation(mockTransaction);
      policyModel.create.mockResolvedValue(mockPolicy);

      const result = await service.activatePendingPolicy(activateDto);

      expect(result).toEqual({
        id: 1,
        policyNumber: expect.stringMatching(/^POL-OPT-\d+-[A-Z0-9]+$/),
        planId: 1,
        createdAt: mockPolicy.createdAt,
        updatedAt: mockPolicy.updatedAt,
        userId: 1,
        product: {
          id: 1,
          name: 'Optimal Care Mini',
          price: 10000.0,
          category: {
            name: 'Health Insurance',
          },
        },
      });

      expect(pendingPolicyModel.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: Plan,
            as: 'plan',
            include: [
              {
                model: User,
                as: 'user',
              },
              {
                model: Product,
                as: 'product',
                include: [
                  {
                    model: ProductCategory,
                    as: 'category',
                    attributes: ['name'],
                  },
                ],
              },
            ],
          },
        ],
      });

      expect(policyModel.sequelize.transaction).toHaveBeenCalled();
      expect(policyModel.create).toHaveBeenCalledWith(
        {
          policyTypeId: 1,
          userId: 1,
          planId: 1,
          policyNumber: expect.stringMatching(/^POL-OPT-\d+-[A-Z0-9]+$/),
        },
        { transaction: expect.any(Object) },
      );
      expect(mockPendingPolicyWithUpdate.update).toHaveBeenCalledWith(
        { status: 'used', deletedAt: expect.any(Date) },
        { transaction: expect.any(Object) },
      );
    });

    it('should activate a pending policy with custom userId', async () => {
      const activateDto = { pendingPolicyId: 1, userId: 2 };
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTransactionObj = { id: 'mock-transaction' };
        return await callback(mockTransactionObj);
      });

      const mockPendingPolicyWithUpdate = {
        ...mockPendingPolicy,
        update: jest.fn().mockResolvedValue([1]),
      };

      pendingPolicyModel.findByPk.mockResolvedValue(
        mockPendingPolicyWithUpdate,
      );
      userModel.findByPk.mockResolvedValue({ id: 2, fullName: 'Jane Doe' });
      policyModel.findOne.mockResolvedValue(null);
      policyModel.sequelize.transaction.mockImplementation(mockTransaction);
      policyModel.create.mockResolvedValue(mockPolicy);

      const result = await service.activatePendingPolicy(activateDto);

      expect(result.userId).toBe(2);
      expect(userModel.findByPk).toHaveBeenCalledWith(2, { raw: true });
    });

    it('should throw BadRequestException when pending policy not found', async () => {
      const activateDto = { pendingPolicyId: 999, userId: undefined };

      pendingPolicyModel.findByPk.mockResolvedValue(null);

      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        'Pending policy with ID 999 not found',
      );
    });

    it('should throw BadRequestException when pending policy is already used', async () => {
      const activateDto = { pendingPolicyId: 1, userId: undefined };
      const usedPendingPolicy = { ...mockPendingPolicy, status: 'used' };

      pendingPolicyModel.findByPk.mockResolvedValue(usedPendingPolicy);

      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        'This pending policy has already been used',
      );
    });

    it('should throw BadRequestException when custom user not found', async () => {
      const activateDto = { pendingPolicyId: 1, userId: 999 };

      pendingPolicyModel.findByPk.mockResolvedValue(mockPendingPolicy);
      userModel.findByPk.mockResolvedValue(null);

      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        'The user you are trying to buy a policy for is not found',
      );
    });

    it('should throw BadRequestException when user already has policy for this plan', async () => {
      const activateDto = { pendingPolicyId: 1, userId: undefined };
      const existingPolicy = { id: 2, userId: 1, policyTypeId: 1 };

      pendingPolicyModel.findByPk.mockResolvedValue(mockPendingPolicy);
      policyModel.findOne.mockResolvedValue(existingPolicy);

      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        'User already has a policy for this plan. Only one policy per user per plan is allowed.',
      );
    });

    it('should handle database errors during activation', async () => {
      const activateDto = { pendingPolicyId: 1, userId: undefined };
      const mockError = new Error('Database connection failed');

      pendingPolicyModel.findByPk.mockRejectedValue(mockError);

      await expect(service.activatePendingPolicy(activateDto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return all policies when no filters applied', async () => {
      const mockPolicies = [mockPolicyWithNestedDataForFindAll];
      policyModel.findAll.mockResolvedValue(mockPolicies);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        policyNumber: 'POL-OPT-1234567890-ABC123',
        userId: 1,
        planId: 1,
        createdAt: mockPolicyWithNestedDataForFindAll.createdAt,
        updatedAt: mockPolicyWithNestedDataForFindAll.updatedAt,
        user: {
          id: 1,
          fullName: 'John Doe',
          email: 'john@example.com',
        },
        product: {
          id: 1,
          name: 'Optimal Care Mini',
          price: 10000.0,
          category: {
            name: 'Health Insurance',
          },
        },
      });

      expect(policyModel.findAll).toHaveBeenCalledWith({
        where: {},
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email'],
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price'],
            include: [
              {
                model: ProductCategory,
                as: 'category',
                attributes: ['name'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        nest: true,
        raw: true,
      });
    });

    it('should return filtered policies when planId filter is applied', async () => {
      const filters = { planId: 1 };
      const mockPolicies = [mockPolicyWithNestedDataForFindAll];
      policyModel.findAll.mockResolvedValue(mockPolicies);

      const result = await service.findAll(filters);

      expect(result).toHaveLength(1);
      expect(policyModel.findAll).toHaveBeenCalledWith({
        where: { planId: 1 },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email'],
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price'],
            include: [
              {
                model: ProductCategory,
                as: 'category',
                attributes: ['name'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        nest: true,
        raw: true,
      });
    });

    it('should return empty array when no policies exist', async () => {
      policyModel.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(policyModel.findAll).toHaveBeenCalledWith({
        where: {},
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email'],
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price'],
            include: [
              {
                model: ProductCategory,
                as: 'category',
                attributes: ['name'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        nest: true,
        raw: true,
      });
    });

    it('should handle database errors and throw them', async () => {
      const mockError = new Error('Database query failed');
      policyModel.findAll.mockRejectedValue(mockError);

      await expect(service.findAll()).rejects.toThrow('Database query failed');
    });

    it('should handle multiple policies correctly', async () => {
      const mockMultiplePolicies = [
        mockPolicyWithNestedDataForFindAll,
        {
          ...mockPolicyWithNestedDataForFindAll,
          id: 2,
          policyNumber: 'POL-OPT-1234567890-DEF456',
          user: {
            id: 2,
            fullName: 'Jane Smith',
            email: 'jane@example.com',
          },
        },
      ];
      policyModel.findAll.mockResolvedValue(mockMultiplePolicies);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[0].user.fullName).toBe('John Doe');
      expect(result[1].user.fullName).toBe('Jane Smith');
    });
  });

  describe('findById', () => {
    it('should return policy by ID successfully', async () => {
      policyModel.findByPk.mockResolvedValue(mockPolicyWithNestedData);

      const result = await service.findById(1);

      expect(result).toEqual({
        id: 1,
        policyNumber: 'POL-OPT-1234567890-ABC123',
        userId: 1,
        planId: 1,
        createdAt: mockPolicyWithNestedData.createdAt,
        updatedAt: mockPolicyWithNestedData.updatedAt,
        user: {
          id: 1,
          fullName: 'John Doe',
          email: 'john@example.com',
        },
        product: {
          id: 1,
          name: 'Optimal Care Mini',
          price: 10000.0,
          category: {
            name: 'Health Insurance',
          },
        },
      });

      expect(policyModel.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email'],
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price'],
            include: [
              {
                model: ProductCategory,
                as: 'category',
                attributes: ['name'],
              },
            ],
          },
        ],
      });
    });

    it('should return null when policy not found', async () => {
      policyModel.findByPk.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
      expect(policyModel.findByPk).toHaveBeenCalledWith(999, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email'],
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price'],
            include: [
              {
                model: ProductCategory,
                as: 'category',
                attributes: ['name'],
              },
            ],
          },
        ],
      });
    });

    it('should handle database errors and throw them', async () => {
      const mockError = new Error('Database query failed');
      policyModel.findByPk.mockRejectedValue(mockError);

      await expect(service.findById(1)).rejects.toThrow(
        'Database query failed',
      );
    });

    it('should handle invalid ID parameter', async () => {
      const mockError = new Error('Invalid ID format');
      policyModel.findByPk.mockRejectedValue(mockError);

      await expect(service.findById(-1)).rejects.toThrow('Invalid ID format');
    });

    it('should handle zero ID parameter', async () => {
      policyModel.findByPk.mockResolvedValue(null);

      const result = await service.findById(0);

      expect(result).toBeNull();
    });
  });

  describe('generatePolicyNumber', () => {
    it('should generate policy number with correct format', () => {
      const productName = 'Optimal Care Mini';

      // Access the private method using any type
      const result = (service as any).generatePolicyNumber(productName);

      expect(result).toMatch(/^POL-OPT-\d+-[A-Z0-9]+$/);
      expect(result).toContain('POL-OPT-');
      expect(result).toContain('-');
    });

    it('should generate unique policy numbers for different calls', () => {
      const productName = 'Test Product';

      const result1 = (service as any).generatePolicyNumber(productName);
      const result2 = (service as any).generatePolicyNumber(productName);

      expect(result1).not.toBe(result2);
      expect(result1).toMatch(/^POL-TES-\d+-[A-Z0-9]+$/);
      expect(result2).toMatch(/^POL-TES-\d+-[A-Z0-9]+$/);
    });

    it('should handle short product names', () => {
      const productName = 'Hi';

      const result = (service as any).generatePolicyNumber(productName);

      expect(result).toMatch(/^POL-HI-\d+-[A-Z0-9]+$/);
    });

    it('should handle long product names', () => {
      const productName = 'Very Long Product Name That Exceeds Normal Length';

      const result = (service as any).generatePolicyNumber(productName);

      expect(result).toMatch(/^POL-VER-\d+-[A-Z0-9]+$/);
    });
  });

  describe('Service Configuration', () => {
    it('should have correct dependencies injected', () => {
      expect(service).toBeDefined();
      expect(policyModel).toBeDefined();
      expect(pendingPolicyModel).toBeDefined();
      expect(userModel).toBeDefined();
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform raw data to DTO format', async () => {
      const rawData = {
        id: 1,
        policyNumber: 'POL-TEST-1234567890-XYZ789',
        userId: 2,
        planId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 2,
          fullName: 'Jane Smith',
          email: 'jane@example.com',
        },
        product: {
          id: 2,
          name: 'Optimal Care Standard',
          price: 20000.0,
          category: {
            name: 'Health Insurance',
          },
        },
      };

      policyModel.findAll.mockResolvedValue([rawData]);

      const result = await service.findAll();

      expect(result[0]).toEqual({
        id: 1,
        policyNumber: 'POL-TEST-1234567890-XYZ789',
        userId: 2,
        planId: 2,
        createdAt: rawData.createdAt,
        updatedAt: rawData.updatedAt,
        user: {
          id: 2,
          fullName: 'Jane Smith',
          email: 'jane@example.com',
        },
        product: {
          id: 2,
          name: 'Optimal Care Standard',
          price: 20000.0,
          category: {
            name: 'Health Insurance',
          },
        },
      });
    });

    it('should handle missing optional fields gracefully', async () => {
      const rawDataWithMissingFields = {
        id: 1,
        policyNumber: 'POL-TEST-1234567890-XYZ789',
        userId: 1,
        planId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 1,
          fullName: 'John Doe',
          // Missing user.email
        },
        product: {
          id: 1,
          name: 'Test Product',
          price: 10000.0,
          // Missing product.category.name
        },
      };

      policyModel.findAll.mockResolvedValue([rawDataWithMissingFields]);

      const result = await service.findAll();

      expect(result[0].user.email).toBeUndefined();
      expect(result[0].product.category.name).toBeUndefined();
    });
  });
});
