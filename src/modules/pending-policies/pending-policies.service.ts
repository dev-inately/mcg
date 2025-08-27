import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PendingPolicy } from '../../models/pending-policy.model';
import { Plan } from '../../models/plan.model';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { PendingPolicyResponseDto } from '../../dto/pending-policy.dto';

@Injectable()
export class PendingPoliciesService {
  constructor(
    @InjectModel(PendingPolicy)
    private readonly pendingPolicyModel: typeof PendingPolicy,
    @InjectModel(Plan)
    private readonly planModel: typeof Plan,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  async findByPlanId(planId: number): Promise<PendingPolicyResponseDto[]> {
    const pendingPolicies = await this.pendingPolicyModel.findAll({
      where: { plan_id: planId },
      include: [
        {
          model: Plan,
          as: 'plan',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    return pendingPolicies.map(pendingPolicy => ({
      id: pendingPolicy.id,
      plan_id: pendingPolicy.plan_id,
      status: pendingPolicy.status,
      plan: {
        id: pendingPolicy.plan.id,
        user_id: pendingPolicy.plan.user_id,
        product_id: pendingPolicy.plan.product_id,
        quantity: pendingPolicy.plan.quantity,
        total_amount: pendingPolicy.plan.total_amount,
        user: {
          id: pendingPolicy.plan.user.id,
          name: pendingPolicy.plan.user.name,
        },
        product: {
          id: pendingPolicy.plan.product.id,
          name: pendingPolicy.plan.product.name,
          price: pendingPolicy.plan.product.price,
        },
      },
      created_at: pendingPolicy.created_at,
      updated_at: pendingPolicy.updated_at,
    }));
  }

  async findById(id: number): Promise<PendingPolicyResponseDto | null> {
    const pendingPolicy = await this.pendingPolicyModel.findByPk(id, {
      include: [
        {
          model: Plan,
          as: 'plan',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
    });

    if (!pendingPolicy) {
      return null;
    }

    return {
      id: pendingPolicy.id,
      plan_id: pendingPolicy.plan_id,
      status: pendingPolicy.status,
      plan: {
        id: pendingPolicy.plan.id,
        user_id: pendingPolicy.plan.user_id,
        product_id: pendingPolicy.plan.product_id,
        quantity: pendingPolicy.plan.quantity,
        total_amount: pendingPolicy.plan.total_amount,
        user: {
          id: pendingPolicy.plan.user.id,
          name: pendingPolicy.plan.user.name,
        },
        product: {
          id: pendingPolicy.plan.product.id,
          name: pendingPolicy.plan.product.name,
          price: pendingPolicy.plan.product.price,
        },
      },
      created_at: pendingPolicy.created_at,
      updated_at: pendingPolicy.updated_at,
    };
  }

  async findUnusedByPlanId(planId: number): Promise<PendingPolicyResponseDto[]> {
    const pendingPolicies = await this.pendingPolicyModel.findAll({
      where: { 
        plan_id: planId,
        status: 'unused'
      },
      include: [
        {
          model: Plan,
          as: 'plan',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    return pendingPolicies.map(pendingPolicy => ({
      id: pendingPolicy.id,
      plan_id: pendingPolicy.plan_id,
      status: pendingPolicy.status,
      plan: {
        id: pendingPolicy.plan.id,
        user_id: pendingPolicy.plan.user_id,
        product_id: pendingPolicy.plan.product_id,
        quantity: pendingPolicy.plan.quantity,
        total_amount: pendingPolicy.plan.total_amount,
        user: {
          id: pendingPolicy.plan.user.id,
          name: pendingPolicy.plan.user.name,
        },
        product: {
          id: pendingPolicy.plan.product.id,
          name: pendingPolicy.plan.product.name,
          price: pendingPolicy.plan.product.price,
        },
      },
      created_at: pendingPolicy.created_at,
      updated_at: pendingPolicy.updated_at,
    }));
  }
}
