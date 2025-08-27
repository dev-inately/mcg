import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductResponseDto, ProductCategoryResponseDto } from '../../dto/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with categories and prices' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all products',
    type: [ProductResponseDto]
  })
  async findAll(): Promise<ProductResponseDto[]> {
    return this.productsService.findAll();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories with their products' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all product categories',
    type: [ProductCategoryResponseDto]
  })
  async findAllCategories(): Promise<ProductCategoryResponseDto[]> {
    return this.productsService.findAllCategories();
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Get products by category ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of products in the specified category',
    type: [ProductResponseDto]
  })
  async findByCategory(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto[]> {
    return this.productsService.findByCategory(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product details',
    type: ProductResponseDto
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto | null> {
    return this.productsService.findById(id);
  }
}
