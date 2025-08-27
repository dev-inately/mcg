import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePlanDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  product_id: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class PlanResponseDto {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  total_amount: number;
  user: {
    id: number;
    name: string;
    wallet_balance: number;
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
  created_at: Date;
  updated_at: Date;
}
