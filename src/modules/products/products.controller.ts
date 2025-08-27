import { Controller, Get, Param, ParseIntPipe, Query, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  ProductResponseDto,
  ProductCategoryResponseDto,
} from '../../dto/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with categories and prices' })
  @ApiResponse({
    status: 200,
    description: 'List of all products',
    type: [ProductResponseDto],
  })
  async findAll(): Promise<ProductResponseDto[]> {
    this.logger.log('GET /products - Fetching all products');
    const startTime = Date.now();
    
    try {
      const result = await this.productsService.findAll();
      const duration = Date.now() - startTime;
      
      this.logger.log('GET /products - Successfully fetched all products', {
        productCount: result.length,
        duration: `${duration}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('GET /products - Failed to fetch all products', {
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories with their products' })
  @ApiResponse({
    status: 200,
    description: 'List of all product categories',
    type: [ProductCategoryResponseDto],
  })
  async findAllCategories(): Promise<ProductCategoryResponseDto[]> {
    this.logger.log('GET /products/categories - Fetching all product categories');
    const startTime = Date.now();
    
    try {
      const result = await this.productsService.findAllCategories();
      const duration = Date.now() - startTime;
      
      this.logger.log('GET /products/categories - Successfully fetched all categories', {
        categoryCount: result.length,
        totalProducts: result.reduce((sum, cat) => sum + cat.products.length, 0),
        duration: `${duration}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('GET /products/categories - Failed to fetch categories', {
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Get products by category ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'List of products in the specified category',
    type: [ProductResponseDto],
  })
  async findByCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDto[]> {
    this.logger.log(`GET /products/category/${id} - Fetching products for category`);
    const startTime = Date.now();
    
    try {
      const result = await this.productsService.findByCategory(id);
      const duration = Date.now() - startTime;
      
      this.logger.log(`GET /products/category/${id} - Successfully fetched category products`, {
        categoryId: id,
        productCount: result.length,
        duration: `${duration}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`GET /products/category/${id} - Failed to fetch category products`, {
        categoryId: id,
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductResponseDto,
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDto | null> {
    this.logger.log(`GET /products/${id} - Fetching product by ID`);
    const startTime = Date.now();
    
    try {
      const result = await this.productsService.findById(id);
      const duration = Date.now() - startTime;
      
      if (result) {
        this.logger.log(`GET /products/${id} - Successfully fetched product`, {
          productId: id,
          productName: result.name,
          duration: `${duration}ms`,
        });
      } else {
        this.logger.warn(`GET /products/${id} - Product not found`, {
          productId: id,
          duration: `${duration}ms`,
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`GET /products/${id} - Failed to fetch product`, {
        productId: id,
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }
}
