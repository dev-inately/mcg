import { IsString, IsNumber, IsOptional } from 'class-validator';

export class PolicyResponseDto {
  id: number;
  pending_policy_id: number;
  user_id: number;
  plan_id: number;
  policy_number: string;
  user: {
    id: number;
    name: string;
  };
  plan: {
    id: number;
    product: {
      id: number;
      name: string;
      price: number;
      category: {
        id: number;
        name: string;
      };
    };
  };
  created_at: Date;
  updated_at: Date;
}

export class PolicyFilterDto {
  @IsOptional()
  @IsNumber()
  plan_id?: number;
}
