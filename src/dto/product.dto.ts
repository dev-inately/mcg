import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  category_id: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  category_id?: number;
}

export class ProductResponseDto {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    description: string;
  };
  created_at: Date;
  updated_at: Date;
}

export class ProductCategoryResponseDto {
  id: number;
  name: string;
  description: string;
  products: ProductResponseDto[];
  created_at: Date;
  updated_at: Date;
}
