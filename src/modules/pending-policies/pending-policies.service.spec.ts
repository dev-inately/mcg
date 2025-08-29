/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { PendingPoliciesService } from './pending-policies.service';
import {
  PendingPolicy,
  Plan,
  User,
  Product,
  ProductCategory,
} from '../../models';

describe('PendingPoliciesService', () => {
  let service: PendingPoliciesService;
  let pendingPolicyModel: typeof PendingPolicy;

  const mockPendingPolicy = {
    id: 1,
    status: 'unused',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    plan: {
      id: 1,
      quantity: 2,
      totalAmount: 200,
      user: {
        id: 1,
        fullName: 'John Doe',
      },
      product: {
        id: 1,
        name: 'Test Insurance',
        price: 100,
        category: {
          id: 1,
          name: 'Health',
        },
      },
    },
  };

  const mockPendingPolicies = [mockPendingPolicy];

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
    pendingPolicyModel = module.get<typeof PendingPolicy>(
      getModelToken(PendingPolicy),
    );

    // Mock logger methods
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByPlanId', () => {
    it('should return pending policies for a given plan ID', async () => {
      jest
        .spyOn(pendingPolicyModel, 'findAll')
        .mockResolvedValue(mockPendingPolicies as any);

      const result = await service.findByPlanId(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 1,
          status: 'unused',
          createdAt: mockPendingPolicy.createdAt,
          updatedAt: mockPendingPolicy.updatedAt,
          deletedAt: null,
          plan: expect.objectContaining({
            id: 1,
            quantity: 2,
            totalAmount: 200,
            user: expect.objectContaining({
              id: 1,
              fullName: 'John Doe',
            }),
            product: expect.objectContaining({
              id: 1,
              name: 'Test Insurance',
              price: 100,
            }),
          }),
        }),
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

    it('should return empty array when no pending policies found', async () => {
      jest.spyOn(pendingPolicyModel, 'findAll').mockResolvedValue([]);

      const result = await service.findByPlanId(999);

      expect(result).toEqual([]);
      expect(pendingPolicyModel.findAll).toHaveBeenCalledWith({
        where: { planId: 999 },
        include: expect.any(Array),
        nest: true,
        raw: true,
        order: [['createdAt', 'ASC']],
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      jest.spyOn(pendingPolicyModel, 'findAll').mockRejectedValue(dbError);

      await expect(service.findByPlanId(1)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should log the correct messages', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      jest
        .spyOn(pendingPolicyModel, 'findAll')
        .mockResolvedValue(mockPendingPolicies as any);

      await service.findByPlanId(1);

      expect(logSpy).toHaveBeenCalledWith(
        'Fetching pending policies for plan ID: 1',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Successfully fetched 1 pending policies for plan 1',
      );
    });

    it('should log error when database operation fails', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const dbError = new Error('Database error');
      jest.spyOn(pendingPolicyModel, 'findAll').mockRejectedValue(dbError);

      await expect(service.findByPlanId(1)).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to fetch pending policies for plan 1',
        expect.objectContaining({
          planId: 1,
          error: 'Database error',
          stack: expect.any(String),
        }),
      );
    });
  });

  describe('findUnusedByPlanId', () => {
    it('should return only unused pending policies for a given plan ID', async () => {
      jest
        .spyOn(pendingPolicyModel, 'findAll')
        .mockResolvedValue(mockPendingPolicies as any);

      const result = await service.findUnusedByPlanId(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 1,
          status: 'unused',
          plan: expect.objectContaining({
            id: 1,
            quantity: 2,
            totalAmount: 200,
          }),
        }),
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

    it('should return empty array when no unused pending policies found', async () => {
      jest.spyOn(pendingPolicyModel, 'findAll').mockResolvedValue([]);

      const result = await service.findUnusedByPlanId(1);

      expect(result).toEqual([]);
    });

    it('should handle database errors in findUnusedByPlanId', async () => {
      const dbError = new Error('Database connection failed');
      jest.spyOn(pendingPolicyModel, 'findAll').mockRejectedValue(dbError);

      await expect(service.findUnusedByPlanId(1)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should log the correct messages for unused policies', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      jest
        .spyOn(pendingPolicyModel, 'findAll')
        .mockResolvedValue(mockPendingPolicies as any);

      await service.findUnusedByPlanId(1);

      expect(logSpy).toHaveBeenCalledWith(
        'Fetching unused pending policies for plan ID: 1',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Successfully fetched 1 unused pending policies for plan 1',
      );
    });

    it('should log error when findUnusedByPlanId fails', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const dbError = new Error('Database error');
      jest.spyOn(pendingPolicyModel, 'findAll').mockRejectedValue(dbError);

      await expect(service.findUnusedByPlanId(1)).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to fetch unused pending policies for plan 1',
        expect.objectContaining({
          planId: 1,
          error: 'Database error',
          stack: expect.any(String),
        }),
      );
    });

    it('should handle multiple unused pending policies', async () => {
      const multiplePendingPolicies = [
        mockPendingPolicy,
        {
          ...mockPendingPolicy,
          id: 2,
          createdAt: new Date('2024-01-02'),
        },
      ];

      jest
        .spyOn(pendingPolicyModel, 'findAll')
        .mockResolvedValue(multiplePendingPolicies as any);

      const result = await service.findUnusedByPlanId(1);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('Service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have Logger instance', () => {
      expect((service as any).logger).toBeInstanceOf(Logger);
    });

    it('should have correct logger name', () => {
      expect((service as any).logger.context).toBe('PendingPoliciesService');
    });
  });
});
