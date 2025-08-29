import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { PendingPoliciesService } from './pending-policies.service';
import { PendingPolicy } from '../../models/pending-policy.model';
import { Plan } from '../../models/plan.model';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';

describe('PendingPoliciesService', () => {
  let service: PendingPoliciesService;
  let pendingPolicyModel: any;

  const mockUser = {
    id: 1,
    fullName: 'John Doe',
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
    quantity: 2,
    totalAmount: 20000.0,
    user: mockUser,
    product: mockProduct,
  };

  const mockPendingPolicy = {
    id: 1,
    status: 'unused',
    createdAt: new Date(),
    updatedAt: new Date(),
    plan: mockPlan,
  };

  const mockPendingPolicyWithNestedData = {
    id: 1,
    status: 'unused',
    planId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    plan: {
      id: 1,
      quantity: 2,
      totalAmount: 20000.0,
      user: {
        id: 1,
        fullName: 'John Doe',
      },
      product: {
        id: 1,
        name: 'Optimal Care Mini',
        price: 10000.0,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendingPoliciesService,
        {
          provide: getModelToken(PendingPolicy),
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PendingPoliciesService>(PendingPoliciesService);
    pendingPolicyModel = module.get(getModelToken(PendingPolicy));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByPlanId', () => {
    it('should return pending policies for a plan successfully', async () => {
      const mockPendingPolicies = [mockPendingPolicyWithNestedData];
      jest
        .spyOn(pendingPolicyModel, 'findAll')
        .mockResolvedValue(mockPendingPolicies);

      const result = await service.findByPlanId(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        status: 'unused',
        createdAt: mockPendingPolicyWithNestedData.createdAt,
        updatedAt: mockPendingPolicyWithNestedData.updatedAt,
        plan: {
          id: 1,
          quantity: 2,
          totalAmount: 20000.0,
          user: {
            id: 1,
            fullName: 'John Doe',
          },
          product: {
            id: 1,
            name: 'Optimal Care Mini',
            price: 10000.0,
          },
        },
      });

      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: { planId: 1 },
        include: [
          {
            model: Plan,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName'],
              },
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
                include: [
                  {
                    model: ProductCategory,
                    as: 'category',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
        nest: true,
        raw: true,
        order: [['createdAt', 'ASC']],
      });
    });

    it('should return empty array when no pending policies exist for plan', async () => {
      jest.spyOn(pendingPolicyModel, 'findAll').mockResolvedValue([]);

      const result = await service.findByPlanId(999);

      expect(result).toEqual([]);
      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: { planId: 999 },
        include: [
          {
            model: Plan,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName'],
              },
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
                include: [
                  {
                    model: ProductCategory,
                    as: 'category',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
        nest: true,
        raw: true,
        order: [['createdAt', 'ASC']],
      });
    });

    it('should handle database errors and throw them', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(pendingPolicyModel, 'findAll').mockRejectedValue(mockError);

      await expect(service.findByPlanId(1)).rejects.toThrow(
        'Database connection failed',
      );
      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: { planId: 1 },
        include: [
          {
            model: Plan,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName'],
              },
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
                include: [
                  {
                    model: ProductCategory,
                    as: 'category',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
        nest: true,
        raw: true,
        order: [['createdAt', 'ASC']],
      });
    });

    it('should handle invalid plan ID gracefully', async () => {
      const mockError = new Error('Invalid plan ID format');
      jest.spyOn(pendingPolicyModel, 'findAll').mockRejectedValue(mockError);

      await expect(service.findByPlanId(-1)).rejects.toThrow(
        'Invalid plan ID format',
      );
      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: { planId: -1 },
        include: [
          {
            model: Plan,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName'],
              },
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
                include: [
                  {
                    model: ProductCategory,
                    as: 'category',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
        nest: true,
        raw: true,
        order: [['createdAt', 'ASC']],
      });
    });

    it('should handle zero plan ID', async () => {
      jest.spyOn(pendingPolicyModel, 'findAll').mockResolvedValue([]);

      const result = await service.findByPlanId(0);

      expect(result).toEqual([]);
      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: { planId: 0 },
        include: [
          {
            model: Plan,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName'],
              },
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
                include: [
                  {
                    model: ProductCategory,
                    as: 'category',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
        nest: true,
        raw: true,
        order: [['createdAt', 'ASC']],
      });
    });
  });

  describe('findUnusedByPlanId', () => {
    it('should return unused pending policies for a plan successfully', async () => {
      const mockUnusedPolicies = [mockPendingPolicyWithNestedData];
      jest
        .spyOn(pendingPolicyModel, 'findAll')
        .mockResolvedValue(mockUnusedPolicies);

      const result = await service.findUnusedByPlanId(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        status: 'unused',
        createdAt: mockPendingPolicyWithNestedData.createdAt,
        updatedAt: mockPendingPolicyWithNestedData.updatedAt,
        plan: {
          id: 1,
          quantity: 2,
          totalAmount: 20000.0,
          user: {
            id: 1,
            fullName: 'John Doe',
          },
          product: {
            id: 1,
            name: 'Optimal Care Mini',
            price: 10000.0,
          },
        },
      });

      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: {
          planId: 1,
          status: 'unused',
        },
        include: [
          {
            model: Plan,
            as: 'plan',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName'],
              },
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
              },
            ],
          },
        ],
        order: [['createdAt', 'ASC']],
        nest: true,
        raw: true,
      });
    });

    it('should return empty array when no unused pending policies exist for plan', async () => {
      jest.spyOn(pendingPolicyModel, 'findAll').mockResolvedValue([]);

      const result = await service.findUnusedByPlanId(999);

      expect(result).toEqual([]);
      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: {
          planId: 999,
          status: 'unused',
        },
        include: [
          {
            model: Plan,
            as: 'plan',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName'],
              },
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
              },
            ],
          },
        ],
        order: [['createdAt', 'ASC']],
        nest: true,
        raw: true,
      });
    });

    it('should handle database errors and throw them', async () => {
      const mockError = new Error('Database query failed');
      jest.spyOn(pendingPolicyModel, 'findAll').mockRejectedValue(mockError);

      await expect(service.findUnusedByPlanId(1)).rejects.toThrow(
        'Database query failed',
      );
      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: {
          planId: 1,
          status: 'unused',
        },
        include: [
          {
            model: Plan,
            as: 'plan',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName'],
              },
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
              },
            ],
          },
        ],
        order: [['createdAt', 'ASC']],
        nest: true,
        raw: true,
      });
    });

    it('should handle invalid plan ID gracefully', async () => {
      const mockError = new Error('Invalid plan ID format');
      jest.spyOn(pendingPolicyModel, 'findAll').mockRejectedValue(mockError);

      await expect(service.findUnusedByPlanId(-1)).rejects.toThrow(
        'Invalid plan ID format',
      );
      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: {
          planId: -1,
          status: 'unused',
        },
        include: [
          {
            model: Plan,
            as: 'plan',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName'],
              },
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
              },
            ],
          },
        ],
        order: [['createdAt', 'ASC']],
        nest: true,
        raw: true,
      });
    });

    it('should handle zero plan ID', async () => {
      jest.spyOn(pendingPolicyModel, 'findAll').mockResolvedValue([]);

      const result = await service.findUnusedByPlanId(0);

      expect(result).toEqual([]);
      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: {
          planId: 0,
          status: 'unused',
        },
        include: [
          {
            model: Plan,
            as: 'plan',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName'],
              },
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
              },
            ],
          },
        ],
        order: [['createdAt', 'ASC']],
        nest: true,
        raw: true,
      });
    });

    it('should handle multiple unused pending policies', async () => {
      const mockMultiplePolicies = [
        mockPendingPolicyWithNestedData,
        {
          ...mockPendingPolicyWithNestedData,
          id: 2,
          plan: {
            ...mockPendingPolicyWithNestedData.plan,
            id: 2,
            quantity: 1,
            totalAmount: 10000.0,
          },
        },
      ];
      jest
        .spyOn(pendingPolicyModel, 'findAll')
        .mockResolvedValue(mockMultiplePolicies);

      const result = await service.findUnusedByPlanId(1);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[0].plan.quantity).toBe(2);
      expect(result[1].plan.quantity).toBe(1);
    });
  });

  describe('Service Configuration', () => {
    it('should have correct dependencies injected', () => {
      expect(service).toBeDefined();
      expect(pendingPolicyModel).toBeDefined();
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform raw data to DTO format', async () => {
      const rawData = {
        id: 1,
        status: 'unused',
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: {
          id: 1,
          quantity: 3,
          totalAmount: 30000.0,
          user: {
            id: 2,
            fullName: 'Jane Smith',
          },
          product: {
            id: 2,
            name: 'Optimal Care Standard',
            price: 20000.0,
          },
        },
      };

      jest.spyOn(pendingPolicyModel, 'findAll').mockResolvedValue([rawData]);

      const result = await service.findByPlanId(1);

      expect(result[0]).toEqual({
        id: 1,
        status: 'unused',
        createdAt: rawData.createdAt,
        updatedAt: rawData.updatedAt,
        plan: {
          id: 1,
          quantity: 3,
          totalAmount: 30000.0,
          user: {
            id: 2,
            fullName: 'Jane Smith',
          },
          product: {
            id: 2,
            name: 'Optimal Care Standard',
            price: 20000.0,
          },
        },
      });
    });

    it('should handle missing optional fields gracefully', async () => {
      const rawDataWithMissingFields = {
        id: 1,
        status: 'unused',
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: {
          id: 1,
          quantity: 1,
          totalAmount: 10000.0,
          user: {
            id: 1,
            fullName: 'John Doe',
          },
          product: {
            // Missing product fields
          },
        },
      };

      jest
        .spyOn(pendingPolicyModel, 'findAll')
        .mockResolvedValue([rawDataWithMissingFields]);

      const result = await service.findByPlanId(1);

      expect(result[0].plan.product).toEqual({
        id: undefined,
        name: undefined,
        price: undefined,
      });
    });
  });
});
