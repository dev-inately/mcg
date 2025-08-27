import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class PendingPolicyResponseDto {
  id: number;
  plan_id: number;
  status: 'unused' | 'used';
  plan: {
    id: number;
    user_id: number;
    product_id: number;
    quantity: number;
    total_amount: number;
    user: {
      id: number;
      name: string;
    };
    product: {
      id: number;
      name: string;
      price: number;
    };
  };
  created_at: Date;
  updated_at: Date;
}

export class ActivatePendingPolicyDto {
  @IsNumber()
  pending_policy_id: number;
}
