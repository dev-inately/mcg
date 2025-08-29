import { IsString, IsNumber, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  categoryId: number;
}

export class ProductResponseDto {
  id: number;
  name: string;
  price: number;
  category: {
    id: number;
    name: string;
    description: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ProductCategoryResponseDto {
  id: number;
  name: string;
  description: string;
  products: ProductResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
