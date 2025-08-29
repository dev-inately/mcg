import { IsNumber, IsOptional } from 'class-validator';

export class PolicyResponseDto {
  id: number;
  userId: number;
  planId: number;
  policyNumber: string;
  product: {
    id: number;
    name: string;
    price: number;
    category: {
      name: string;
    };
  };
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class PolicyFilterDto {
  @IsOptional()
  @IsNumber()
  planId?: number;
}
