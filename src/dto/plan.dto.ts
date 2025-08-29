import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePlanDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity: number = 1;
}

export class PlanResponseDto {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  user: {
    id: number;
    fullName: string;
  };
  product: {
    id: number;
    name: string;
    price: number;
    category: {
      id: number;
      name: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
