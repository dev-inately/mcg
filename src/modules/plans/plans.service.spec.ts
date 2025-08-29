/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { PlansService } from './plans.service';
import {
  Plan,
  User,
  Product,
  ProductCategory,
  PendingPolicy,
  Transaction,
  Wallet,
} from '../../models';
import { CreatePlanDto } from '../../dto/plan.dto';

describe('PlansService', () => {
  let service: PlansService;
  let planModel: typeof Plan;
  let userModel: typeof User;
  let productModel: typeof Product;
  let pendingPolicyModel: typeof PendingPolicy;
  let transactionModel: typeof Transaction;
  let mockTransaction: any;

  const mockUser = {
    id: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    dataValues: {
      id: 1,
      fullName: 'John Doe',
    },
    wallet: {
      id: 1,
      walletBalance: 1000,
      update: jest.fn(),
    },
  };

  const mockProduct = {
    id: 1,
    name: 'Test Insurance',
    price: 100,
    dataValues: {
      id: 1,
      name: 'Test Insurance',
      price: 100,
      category: { id: 1, name: 'Health' },
    },
  };

  const mockPlan = {
    id: 1,
    userId: 1,
    productId: 1,
    quantity: 2,
    totalAmount: 200,
    createdAt: new Date(),
    updatedAt: new Date(),
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
        PlansService,
        {
          provide: getModelToken(Plan),
          useValue: {
            create: jest.fn(),
            findByPk: jest.fn(),
            findAll: jest.fn(),
            sequelize: mockSequelize,
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findByPk: jest.fn(),
          },
        },
        {
          provide: getModelToken(Product),
          useValue: {
            findByPk: jest.fn(),
          },
        },
        {
          provide: getModelToken(PendingPolicy),
          useValue: {
            bulkCreate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Transaction),
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
    planModel = module.get<typeof Plan>(getModelToken(Plan));
    userModel = module.get<typeof User>(getModelToken(User));
    productModel = module.get<typeof Product>(getModelToken(Product));
    pendingPolicyModel = module.get<typeof PendingPolicy>(
      getModelToken(PendingPolicy),
    );
    transactionModel = module.get<typeof Transaction>(
      getModelToken(Transaction),
    );

    // Mock logger methods
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPlan', () => {
    const createPlanDto: CreatePlanDto = {
      userId: 1,
      productId: 1,
      quantity: 2,
    };

    it('should successfully create a plan', async () => {
      const mockCreatedPlan = {
        id: 1,
        userId: 1,
        productId: 1,
        quantity: 2,
        totalAmount: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPendingPolicies = [
        { id: 1, planId: 1, status: 'unused' },
        { id: 2, planId: 1, status: 'unused' },
      ];

      const mockTransactionRecord = {
        id: 1,
        planId: 1,
        amount: 200,
        userId: 1,
        walletId: 1,
      };

      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);
      jest
        .spyOn(productModel, 'findByPk')
        .mockResolvedValue(mockProduct as any);
      jest.spyOn(planModel, 'create').mockResolvedValue(mockCreatedPlan as any);
      jest
        .spyOn(pendingPolicyModel, 'bulkCreate')
        .mockResolvedValue(mockPendingPolicies as any);
      jest
        .spyOn(transactionModel, 'create')
        .mockResolvedValue(mockTransactionRecord as any);
      jest.spyOn(mockUser.wallet, 'update').mockResolvedValue(mockUser.wallet);

      const result = await service.createPlan(createPlanDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          userId: 1,
          productId: 1,
          quantity: 2,
          totalAmount: 200,
          user: { id: 1, fullName: 'John Doe' },
        }),
      );

      expect(userModel.findByPk).toHaveBeenCalledWith(1, {
        include: [
          { model: Wallet, as: 'wallet', attributes: ['id', 'walletBalance'] },
        ],
      });
      expect(productModel.findByPk).toHaveBeenCalledWith(1, { raw: true });
      expect(mockUser.wallet.update).toHaveBeenCalledWith(
        { walletBalance: 800 },
        { transaction: mockTransaction },
      );
      expect(planModel.create).toHaveBeenCalledWith(
        {
          userId: 1,
          productId: 1,
          quantity: 2,
          totalAmount: 200,
        },
        { transaction: mockTransaction },
      );
      expect(pendingPolicyModel.bulkCreate).toHaveBeenCalledWith(
        [
          { planId: 1, status: 'unused' },
          { planId: 1, status: 'unused' },
        ],
        { transaction: mockTransaction },
      );
    });

    it('should throw BadRequestException when user not found', async () => {
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(null);

      await expect(service.createPlan(createPlanDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userModel.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should throw BadRequestException when user has no wallet', async () => {
      const userWithoutWallet = { ...mockUser, wallet: null };
      jest
        .spyOn(userModel, 'findByPk')
        .mockResolvedValue(userWithoutWallet as any);

      await expect(service.createPlan(createPlanDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when product not found', async () => {
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);
      jest.spyOn(productModel, 'findByPk').mockResolvedValue(null);

      await expect(service.createPlan(createPlanDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(productModel.findByPk).toHaveBeenCalledWith(1, { raw: true });
    });

    it('should throw BadRequestException when insufficient wallet balance', async () => {
      const poorUser = {
        ...mockUser,
        wallet: { ...mockUser.wallet, walletBalance: 50 },
      };
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(poorUser as any);
      jest
        .spyOn(productModel, 'findByPk')
        .mockResolvedValue(mockProduct as any);

      await expect(service.createPlan(createPlanDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should calculate correct total amount', async () => {
      const createPlanDtoWithHighQuantity = { ...createPlanDto, quantity: 5 };
      const mockCreatedPlan = {
        id: 1,
        userId: 1,
        productId: 1,
        quantity: 5,
        totalAmount: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);
      jest
        .spyOn(productModel, 'findByPk')
        .mockResolvedValue(mockProduct as any);
      jest.spyOn(planModel, 'create').mockResolvedValue(mockCreatedPlan as any);
      jest.spyOn(pendingPolicyModel, 'bulkCreate').mockResolvedValue([]);
      jest.spyOn(transactionModel, 'create').mockResolvedValue({} as any);

      await service.createPlan(createPlanDtoWithHighQuantity);

      expect(mockUser.wallet.update).toHaveBeenCalledWith(
        { walletBalance: 500 },
        { transaction: mockTransaction },
      );
    });

    it('should handle transaction errors', async () => {
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);
      jest
        .spyOn(productModel, 'findByPk')
        .mockResolvedValue(mockProduct as any);
      jest
        .spyOn(planModel, 'create')
        .mockRejectedValue(new Error('Transaction failed'));

      await expect(service.createPlan(createPlanDto)).rejects.toThrow(
        'Transaction failed',
      );
    });
  });

  describe('findById', () => {
    it('should return plan by id', async () => {
      jest.spyOn(planModel, 'findByPk').mockResolvedValue(mockPlan as any);

      const result = await service.findById(1);

      expect(result).toEqual(mockPlan);
      expect(planModel.findByPk).toHaveBeenCalledWith(1, {
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
        raw: true,
        nest: true,
      });
    });

    it('should return null when plan not found', async () => {
      jest.spyOn(planModel, 'findByPk').mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      jest
        .spyOn(planModel, 'findByPk')
        .mockRejectedValue(new Error('DB Error'));

      await expect(service.findById(1)).rejects.toThrow('DB Error');
    });

    it('should log correct messages', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      jest.spyOn(planModel, 'findByPk').mockResolvedValue(mockPlan as any);

      await service.findById(1);

      expect(logSpy).toHaveBeenCalledWith('Fetching plan by ID: 1');
      expect(logSpy).toHaveBeenCalledWith(
        'Successfully fetched plan: ID 1 for user John Doe',
      );
    });
  });

  describe('findByUserId', () => {
    it('should return plans for a given user ID', async () => {
      const mockPlans = [mockPlan];
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);
      jest.spyOn(planModel, 'findAll').mockResolvedValue(mockPlans as any);

      const result = await service.findByUserId(1);

      expect(result).toEqual(mockPlans);
      expect(userModel.findByPk).toHaveBeenCalledWith(1, {
        raw: true,
        attributes: ['id'],
      });
      expect(planModel.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
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
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
        order: [['createdAt', 'ASC']],
        nest: true,
        raw: true,
      });
    });

    it('should throw BadRequestException when user not found', async () => {
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(null);

      await expect(service.findByUserId(999)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return empty array when no plans found', async () => {
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);
      jest.spyOn(planModel, 'findAll').mockResolvedValue([]);

      const result = await service.findByUserId(1);

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);
      jest.spyOn(planModel, 'findAll').mockRejectedValue(new Error('DB Error'));

      await expect(service.findByUserId(1)).rejects.toThrow('DB Error');
    });

    it('should log correct messages', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser as any);
      jest.spyOn(planModel, 'findAll').mockResolvedValue([mockPlan] as any);

      await service.findByUserId(1);

      expect(logSpy).toHaveBeenCalledWith('Fetching plans for user ID: 1');
      expect(logSpy).toHaveBeenCalledWith(
        'Successfully fetched 1 plans for user 1',
      );
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
      expect((service as any).logger.context).toBe('PlansService');
    });
  });
});
