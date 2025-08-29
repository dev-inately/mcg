import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ProductsService } from './products.service';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: any;
  let productCategoryModel: any;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 10000.0,
    category: {
      id: 1,
      name: 'Health',
      description: 'Health insurance products',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductCategory = {
    id: 1,
    name: 'Health',
    description: 'Health insurance products',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
    productModel = module.get(getModelToken(Product));
    productCategoryModel = module.get(getModelToken(ProductCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products with categories successfully', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(productModel, 'findAll').mockResolvedValue(mockProducts);

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

    it('should return empty array when no products exist', async () => {
      jest.spyOn(productModel, 'findAll').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
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

    it('should handle database errors and throw them', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(productModel, 'findAll').mockRejectedValue(mockError);

      await expect(service.findAll()).rejects.toThrow(
        'Database connection failed',
      );
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
  });

  describe('findAllCategories', () => {
    it('should return all product categories successfully', async () => {
      const mockCategories = [mockProductCategory];
      jest
        .spyOn(productCategoryModel, 'findAll')
        .mockResolvedValue(mockCategories);

      const result = await service.findAllCategories();

      expect(result).toEqual(mockCategories);
      expect(productCategoryModel.findAll).toHaveBeenCalledWith({
        order: [['id', 'ASC']], // Add order expectation
        raw: true,
        nest: true,
      });
    });

    it('should return empty array when no categories exist', async () => {
      jest.spyOn(productCategoryModel, 'findAll').mockResolvedValue([]);

      const result = await service.findAllCategories();

      expect(result).toEqual([]);
      expect(productCategoryModel.findAll).toHaveBeenCalledWith({
        order: [['id', 'ASC']], // Add order expectation
        raw: true,
        nest: true,
      });
    });

    it('should handle database errors and throw them', async () => {
      const mockError = new Error('Database query failed');
      jest.spyOn(productCategoryModel, 'findAll').mockRejectedValue(mockError);

      await expect(service.findAllCategories()).rejects.toThrow(
        'Database query failed',
      );
      expect(productCategoryModel.findAll).toHaveBeenCalledWith({
        order: [['id', 'ASC']], // Add order expectation
        raw: true,
        nest: true,
      });
    });
  });

  describe('findById', () => {
    it('should return a product by ID successfully', async () => {
      jest.spyOn(productModel, 'findByPk').mockResolvedValue(mockProduct);

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

    it('should return null if product not found', async () => {
      jest.spyOn(productModel, 'findByPk').mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
      expect(productModel.findByPk).toHaveBeenCalledWith(999, {
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

    it('should handle database errors and throw them', async () => {
      const mockError = new Error('Database query failed');
      jest.spyOn(productModel, 'findByPk').mockRejectedValue(mockError);

      await expect(service.findById(1)).rejects.toThrow(
        'Database query failed',
      );
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

    it('should handle invalid ID parameter gracefully', async () => {
      const mockError = new Error('Invalid ID format');
      jest.spyOn(productModel, 'findByPk').mockRejectedValue(mockError);

      await expect(service.findById(-1)).rejects.toThrow('Invalid ID format');
      expect(productModel.findByPk).toHaveBeenCalledWith(-1, {
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

    it('should handle zero ID parameter', async () => {
      jest.spyOn(productModel, 'findByPk').mockResolvedValue(null);

      const result = await service.findById(0);

      expect(result).toBeNull();
      expect(productModel.findByPk).toHaveBeenCalledWith(0, {
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
  });

  describe('Service Configuration', () => {
    it('should have correct dependencies injected', () => {
      expect(service).toBeDefined();
      expect(productModel).toBeDefined();
      expect(productCategoryModel).toBeDefined();
    });
  });
});
