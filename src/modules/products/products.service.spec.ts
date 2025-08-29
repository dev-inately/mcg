/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { ProductsService } from './products.service';
import { Product, ProductCategory } from '../../models';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: typeof Product;
  let productCategoryModel: typeof ProductCategory;

  const mockProductCategory = {
    id: 1,
    name: 'Health Insurance',
    description: 'Health insurance products',
  };

  const mockProduct = {
    id: 1,
    name: 'Basic Health Plan',
    price: 100,
    description: 'Basic health insurance plan',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    category: mockProductCategory,
  };

  const mockProducts = [mockProduct];
  const mockCategories = [mockProductCategory];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product),
          useValue: {
            findAll: jest.fn(),
            findByPk: jest.fn(),
          },
        },
        {
          provide: getModelToken(ProductCategory),
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get<typeof Product>(getModelToken(Product));
    productCategoryModel = module.get<typeof ProductCategory>(
      getModelToken(ProductCategory),
    );

    // Mock logger methods
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products with categories', async () => {
      jest
        .spyOn(productModel, 'findAll')
        .mockResolvedValue(mockProducts as any);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);
      expect(productModel.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: ProductCategory,
            as: 'category',
            attributes: ['id', 'name', 'description'],
          },
        ],
        attributes: {
          exclude: ['categoryId'],
        },
        raw: true,
        nest: true,
        order: [['createdAt', 'ASC']],
      });
    });

    it('should return empty array when no products found', async () => {
      jest.spyOn(productModel, 'findAll').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      jest.spyOn(productModel, 'findAll').mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should log correct messages', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      jest
        .spyOn(productModel, 'findAll')
        .mockResolvedValue(mockProducts as any);

      await service.findAll();

      expect(logSpy).toHaveBeenCalledWith(
        'Fetching all products with categories',
      );
      expect(logSpy).toHaveBeenCalledWith('Successfully fetched 1 products');
    });

    it('should log error when database operation fails', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const dbError = new Error('Database error');
      jest.spyOn(productModel, 'findAll').mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to fetch all products',
        expect.objectContaining({
          error: 'Database error',
          stack: expect.any(String),
        }),
      );
    });

    it('should handle multiple products', async () => {
      const multipleProducts = [
        mockProduct,
        {
          ...mockProduct,
          id: 2,
          name: 'Premium Health Plan',
          price: 200,
        },
      ];

      jest
        .spyOn(productModel, 'findAll')
        .mockResolvedValue(multipleProducts as any);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('findAllCategories', () => {
    it('should return all product categories', async () => {
      jest
        .spyOn(productCategoryModel, 'findAll')
        .mockResolvedValue(mockCategories as any);

      const result = await service.findAllCategories();

      expect(result).toEqual(mockCategories);
      expect(productCategoryModel.findAll).toHaveBeenCalledWith({
        order: [['id', 'ASC']],
        raw: true,
        nest: true,
      });
    });

    it('should return empty array when no categories found', async () => {
      jest.spyOn(productCategoryModel, 'findAll').mockResolvedValue([]);

      const result = await service.findAllCategories();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      jest.spyOn(productCategoryModel, 'findAll').mockRejectedValue(dbError);

      await expect(service.findAllCategories()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should log correct messages', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      jest
        .spyOn(productCategoryModel, 'findAll')
        .mockResolvedValue(mockCategories as any);

      await service.findAllCategories();

      expect(logSpy).toHaveBeenCalledWith(
        'Fetching all product categories with products',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Successfully fetched 1 product categories',
      );
    });

    it('should log error when database operation fails', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const dbError = new Error('Database error');
      jest.spyOn(productCategoryModel, 'findAll').mockRejectedValue(dbError);

      await expect(service.findAllCategories()).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to fetch all product categories',
        expect.objectContaining({
          error: 'Database error',
          stack: expect.any(String),
        }),
      );
    });

    it('should handle multiple categories', async () => {
      const multipleCategories = [
        mockProductCategory,
        {
          id: 2,
          name: 'Auto Insurance',
          description: 'Auto insurance products',
        },
      ];

      jest
        .spyOn(productCategoryModel, 'findAll')
        .mockResolvedValue(multipleCategories as any);

      const result = await service.findAllCategories();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return product by id', async () => {
      jest
        .spyOn(productModel, 'findByPk')
        .mockResolvedValue(mockProduct as any);

      const result = await service.findById(1);

      expect(result).toEqual(mockProduct);
      expect(productModel.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: ProductCategory,
            as: 'category',
            attributes: ['id', 'name', 'description'],
          },
        ],
        attributes: {
          exclude: ['categoryId'],
        },
        raw: true,
        nest: true,
      });
    });

    it('should return null when product not found', async () => {
      jest.spyOn(productModel, 'findByPk').mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
      expect(productModel.findByPk).toHaveBeenCalledWith(
        999,
        expect.any(Object),
      );
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      jest.spyOn(productModel, 'findByPk').mockRejectedValue(dbError);

      await expect(service.findById(1)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should log correct messages for found product', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      jest
        .spyOn(productModel, 'findByPk')
        .mockResolvedValue(mockProduct as any);

      await service.findById(1);

      expect(logSpy).toHaveBeenCalledWith('Fetching product by ID: 1');
      expect(logSpy).toHaveBeenCalledWith(
        'Successfully fetched product: Basic Health Plan (ID: 1)',
      );
    });

    it('should log warning when product not found', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'warn');
      jest.spyOn(productModel, 'findByPk').mockResolvedValue(null);

      await service.findById(999);

      expect(logSpy).toHaveBeenCalledWith('Product with ID 999 not found');
    });

    it('should log error when database operation fails', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const dbError = new Error('Database error');
      jest.spyOn(productModel, 'findByPk').mockRejectedValue(dbError);

      await expect(service.findById(1)).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to fetch product with ID 1',
        expect.objectContaining({
          productId: 1,
          error: 'Database error',
          stack: expect.any(String),
        }),
      );
    });

    it('should handle product with complex category structure', async () => {
      const complexProduct = {
        ...mockProduct,
        category: {
          id: 1,
          name: 'Health Insurance',
          description: 'Comprehensive health insurance coverage',
        },
      };

      jest
        .spyOn(productModel, 'findByPk')
        .mockResolvedValue(complexProduct as any);

      const result = await service.findById(1);

      expect(result?.category.description).toBe(
        'Comprehensive health insurance coverage',
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
      expect((service as any).logger.context).toBe('ProductsService');
    });

    it('should have correct model injections', () => {
      expect((service as any).productModel).toBeDefined();
      expect((service as any).productCategoryModel).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle unknown error types', async () => {
      const unknownError = { message: 'Unknown error', customProperty: true };
      jest.spyOn(productModel, 'findAll').mockRejectedValue(unknownError);

      await expect(service.findAll()).rejects.toEqual(unknownError);
    });

    it('should handle null responses gracefully', async () => {
      jest.spyOn(productModel, 'findAll').mockResolvedValue(null as any);

      await expect(service.findAll()).rejects.toThrow();
    });
  });
});
