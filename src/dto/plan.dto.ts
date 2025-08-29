import { IsNumber, IsOptional } from 'class-validator';

export class CreatePlanDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  productId: number;

  @IsNumber()
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
