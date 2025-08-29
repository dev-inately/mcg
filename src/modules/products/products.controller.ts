import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  ProductResponseDto,
  ProductCategoryResponseDto,
} from '../../dto/product.dto';
import {
  ResponseHelper,
  ApiResponse as CustomApiResponse,
} from '../../common/helpers';

@ApiTags('Products')
@Controller('/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all insurance products with categories' })
  @ApiResponse({
    status: 200,
    description: 'List of all products',
  })
  async findAll(): Promise<CustomApiResponse<ProductResponseDto[]>> {
    const products = await this.productsService.findAll();
    return ResponseHelper.success(products, 'Products retrieved successfully');
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({
    status: 200,
    description: 'List of all product categories',
  })
  async findAllCategories(): Promise<
    CustomApiResponse<ProductCategoryResponseDto[]>
  > {
    const categories = await this.productsService.findAllCategories();
    return ResponseHelper.success(
      categories,
      'Product categories retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CustomApiResponse<ProductResponseDto | null>> {
    const product = await this.productsService.findById(id);
    return ResponseHelper.success(product, 'Product retrieved successfully');
  }
}
