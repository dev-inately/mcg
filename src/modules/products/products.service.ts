import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product, ProductCategory } from '../../models';
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
        attributes: {
          exclude: ['categoryId'],
        },
        raw: true,
        nest: true,
        order: [['createdAt', 'ASC']],
      });

      this.logger.log(`Successfully fetched ${products.length} products`);

      return products;
    } catch (error: unknown) {
      this.logger.error('Failed to fetch all products', {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      throw error;
    }
  }

  async findAllCategories(): Promise<ProductCategoryResponseDto[]> {
    this.logger.log('Fetching all product categories with products');

    try {
      const categories = await this.productCategoryModel.findAll({
        order: [['id', 'ASC']],
        raw: true,
        nest: true,
      });

      this.logger.log(
        `Successfully fetched ${categories.length} product categories`,
      );

      return categories;
    } catch (error: unknown) {
      this.logger.error('Failed to fetch all product categories', {
        error: (error as Error).message,
        stack: (error as Error).stack,
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
        attributes: {
          exclude: ['categoryId'],
        },
        raw: true,
        nest: true,
      });

      if (!product) {
        this.logger.warn(`Product with ID ${id} not found`);
        return null;
      }

      this.logger.log(
        `Successfully fetched product: ${product.name} (ID: ${id})`,
      );

      return product;
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch product with ID ${id}`, {
        productId: id,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      throw error;
    }
  }
}
