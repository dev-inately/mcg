import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PendingPolicy } from '../../models/pending-policy.model';
import { Plan } from '../../models/plan.model';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { PendingPolicyResponseDto } from '../../dto/pending-policy.dto';

@Injectable()
export class PendingPoliciesService {
  private readonly logger = new Logger(PendingPoliciesService.name);

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
    this.logger.log(`Fetching pending policies for plan ID: ${planId}`);
    
    try {
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

      this.logger.log(`Successfully fetched ${pendingPolicies.length} pending policies for plan ${planId}`);

      const result = pendingPolicies.map((pendingPolicy) => ({
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

      this.logger.debug('Pending policies data mapped successfully', {
        planId,
        pendingPolicyCount: result.length,
        statusBreakdown: result.reduce((acc, policy) => {
          acc[policy.status] = (acc[policy.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        userName: result[0]?.plan.user.name || 'Unknown',
        productName: result[0]?.plan.product.name || 'Unknown'
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch pending policies for plan ${planId}`, {
        planId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findById(id: number): Promise<PendingPolicyResponseDto | null> {
    this.logger.log(`Fetching pending policy by ID: ${id}`);
    
    try {
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
        this.logger.warn(`Pending policy with ID ${id} not found`);
        return null;
      }

      this.logger.log(`Successfully fetched pending policy: ID ${id} for plan ${pendingPolicy.plan_id}`);

      const result = {
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

      this.logger.debug('Pending policy data mapped successfully', {
        pendingPolicyId: result.id,
        planId: result.plan_id,
        status: result.status,
        userName: result.plan.user.name,
        productName: result.plan.product.name,
        quantity: result.plan.quantity,
        totalAmount: result.plan.total_amount
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch pending policy with ID ${id}`, {
        pendingPolicyId: id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findUnusedByPlanId(
    planId: number,
  ): Promise<PendingPolicyResponseDto[]> {
    this.logger.log(`Fetching unused pending policies for plan ID: ${planId}`);
    
    try {
      const pendingPolicies = await this.pendingPolicyModel.findAll({
        where: {
          plan_id: planId,
          status: 'unused',
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

      this.logger.log(`Successfully fetched ${pendingPolicies.length} unused pending policies for plan ${planId}`);

      const result = pendingPolicies.map((pendingPolicy) => ({
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

      this.logger.debug('Unused pending policies data mapped successfully', {
        planId,
        unusedPolicyCount: result.length,
        userName: result[0]?.plan.user.name || 'Unknown',
        productName: result[0]?.plan.product.name || 'Unknown',
        totalValue: result.reduce((sum, policy) => sum + (policy.plan.total_amount / policy.plan.quantity), 0)
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch unused pending policies for plan ${planId}`, {
        planId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
