import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';
import {
  ProductResponseDto,
  ProductCategoryResponseDto,
} from '../../dto/product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    @InjectModel(ProductCategory)
    private readonly productCategoryModel: typeof ProductCategory,
  ) {}

  async findAll(): Promise<ProductResponseDto[]> {
    this.logger.log('Fetching all products with categories');
    
    try {
      const products = await this.productModel.findAll({
        include: [
          {
            model: ProductCategory,
            as: 'category',
            attributes: ['id', 'name', 'description'],
          },
        ],
        order: [['created_at', 'ASC']],
      });

      this.logger.log(`Successfully fetched ${products.length} products`);
      
      const result = products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        category: {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description,
        },
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));

      this.logger.debug('Products data mapped successfully', { 
        productCount: result.length,
        categories: [...new Set(result.map(p => p.category.name))]
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch all products', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findByCategory(categoryId: number): Promise<ProductResponseDto[]> {
    this.logger.log(`Fetching products for category ID: ${categoryId}`);
    
    try {
      const products = await this.productModel.findAll({
        where: { category_id: categoryId },
        include: [
          {
            model: ProductCategory,
            as: 'category',
            attributes: ['id', 'name', 'description'],
          },
        ],
        order: [['created_at', 'ASC']],
      });

      this.logger.log(`Successfully fetched ${products.length} products for category ${categoryId}`);
      
      const result = products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        category: {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description,
        },
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));

      this.logger.debug('Category products data mapped successfully', {
        categoryId,
        productCount: result.length,
        categoryName: result[0]?.category.name || 'Unknown'
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch products for category ${categoryId}`, {
        categoryId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findAllCategories(): Promise<ProductCategoryResponseDto[]> {
    this.logger.log('Fetching all product categories with products');
    
    try {
      const categories = await this.productCategoryModel.findAll({
        include: [
          {
            model: Product,
            as: 'products',
            attributes: ['id', 'name', 'price'],
          },
        ],
        order: [['created_at', 'ASC']],
      });

      this.logger.log(`Successfully fetched ${categories.length} product categories`);
      
      const result = categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        products: category.products.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          category_id: category.id,
          category: {
            id: category.id,
            name: category.name,
            description: category.description,
          },
          created_at: product.created_at,
          updated_at: product.updated_at,
        })),
        created_at: category.created_at,
        updated_at: category.updated_at,
      }));

      this.logger.debug('Categories data mapped successfully', {
        categoryCount: result.length,
        totalProducts: result.reduce((sum, cat) => sum + cat.products.length, 0),
        categoryNames: result.map(cat => cat.name)
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch all product categories', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findById(id: number): Promise<ProductResponseDto | null> {
    this.logger.log(`Fetching product by ID: ${id}`);
    
    try {
      const product = await this.productModel.findByPk(id, {
        include: [
          {
            model: ProductCategory,
            as: 'category',
            attributes: ['id', 'name', 'description'],
          },
        ],
      });

      if (!product) {
        this.logger.warn(`Product with ID ${id} not found`);
        return null;
      }

      this.logger.log(`Successfully fetched product: ${product.name} (ID: ${id})`);
      
      const result = {
        id: product.id,
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        category: {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description,
        },
        created_at: product.created_at,
        updated_at: product.updated_at,
      };

      this.logger.debug('Product data mapped successfully', {
        productId: result.id,
        productName: result.name,
        categoryName: result.category.name,
        price: result.price
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch product with ID ${id}`, {
        productId: id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
