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
    price: 10000.00,
    category_id: 1,
    category: {
      id: 1,
      name: 'Health',
      description: 'Health insurance products',
    },
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockProductCategory = {
    id: 1,
    name: 'Health',
    description: 'Health insurance products',
    products: [mockProduct],
    created_at: new Date(),
    updated_at: new Date(),
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
    it('should return all products with categories', async () => {
      jest.spyOn(productModel, 'findAll').mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(result).toEqual([mockProduct]);
      expect(productModel.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: ProductCategory,
            as: 'category',
            attributes: ['id', 'name', 'description'],
          },
        ],
        order: [['created_at', 'ASC']],
      });
    });
  });

  describe('findByCategory', () => {
    it('should return products filtered by category', async () => {
      jest.spyOn(productModel, 'findAll').mockResolvedValue([mockProduct]);

      const result = await service.findByCategory(1);

      expect(result).toEqual([mockProduct]);
      expect(productModel.findAll).toHaveBeenCalledWith({
        where: { category_id: 1 },
        include: [
          {
            model: ProductCategory,
            as: 'category',
            attributes: ['id', 'name', 'description'],
          },
        ],
        order: [['created_at', 'ASC']],
      });
    });
  });

  describe('findAllCategories', () => {
    it('should return all product categories with products', async () => {
      jest.spyOn(productCategoryModel, 'findAll').mockResolvedValue([mockProductCategory]);

      const result = await service.findAllCategories();

      expect(result).toEqual([mockProductCategory]);
      expect(productCategoryModel.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: Product,
            as: 'products',
            attributes: ['id', 'name', 'price'],
          },
        ],
        order: [['created_at', 'ASC']],
      });
    });
  });

  describe('findById', () => {
    it('should return a product by ID', async () => {
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
      });
    });

    it('should return null if product not found', async () => {
      jest.spyOn(productModel, 'findByPk').mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });
});
