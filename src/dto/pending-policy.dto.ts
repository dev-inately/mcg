import { IsNumber, IsOptional } from 'class-validator';

export class PendingPolicyResponseDto {
  id: number;
  status: 'unused' | 'used';
  plan: {
    id: number;
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
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ActivatePendingPolicyDto {
  @IsNumber()
  pendingPolicyId: number;

  @IsNumber()
  @IsOptional()
  userId?: number;
}
