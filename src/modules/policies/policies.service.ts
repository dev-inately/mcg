import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Policy } from '../../models/policy.model';
import { PendingPolicy } from '../../models/pending-policy.model';
import { Plan } from '../../models/plan.model';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';
import { PolicyResponseDto, PolicyFilterDto } from '../../dto/policy.dto';
import { ActivatePendingPolicyDto } from '../../dto/pending-policy.dto';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(
    @InjectModel(Policy)
    private readonly policyModel: typeof Policy,
    @InjectModel(PendingPolicy)
    private readonly pendingPolicyModel: typeof PendingPolicy,
    @InjectModel(Plan)
    private readonly planModel: typeof Plan,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    @InjectModel(ProductCategory)
    private readonly productCategoryModel: typeof ProductCategory,
  ) {}

  async activatePendingPolicy(
    activateDto: ActivatePendingPolicyDto,
  ): Promise<PolicyResponseDto> {
    const { pending_policy_id } = activateDto;
    
    this.logger.log('Activating pending policy', {
      pendingPolicyId: pending_policy_id,
    });

    try {
      // Find the pending policy
      const pendingPolicy = await this.pendingPolicyModel.findByPk(
        pending_policy_id,
        {
          include: [
            {
              model: Plan,
              as: 'plan',
              include: [
                {
                  model: User,
                  as: 'user',
                },
                {
                  model: Product,
                  as: 'product',
                },
              ],
            },
          ],
        },
      );

      if (!pendingPolicy) {
        this.logger.warn(`Pending policy with ID ${pending_policy_id} not found during activation`);
        throw new NotFoundException(
          `Pending policy with ID ${pending_policy_id} not found`,
        );
      }

      this.logger.debug('Pending policy found for activation', {
        pendingPolicyId: pendingPolicy.id,
        planId: pendingPolicy.plan_id,
        status: pendingPolicy.status,
        userId: pendingPolicy.plan.user_id,
        productId: pendingPolicy.plan.product_id,
      });

      if (pendingPolicy.status === 'used') {
        this.logger.warn('Attempted to activate already used pending policy', {
          pendingPolicyId: pending_policy_id,
          planId: pendingPolicy.plan_id,
        });
        throw new BadRequestException(
          'This pending policy has already been used',
        );
      }

      // Check if user already has a policy for this plan
      const existingPolicy = await this.policyModel.findOne({
        where: {
          user_id: pendingPolicy.plan.user_id,
          plan_id: pendingPolicy.plan.id,
        },
      });

      if (existingPolicy) {
        this.logger.warn('User already has a policy for this plan', {
          userId: pendingPolicy.plan.user_id,
          planId: pendingPolicy.plan.id,
          existingPolicyId: existingPolicy.id,
        });
        throw new BadRequestException(
          'User already has a policy for this plan. Only one policy per user per plan is allowed.',
        );
      }

      // Generate unique policy number
      const policyNumber = this.generatePolicyNumber();
      this.logger.log('Generated policy number', { policyNumber });

      this.logger.log('Starting policy activation transaction', {
        pendingPolicyId: pending_policy_id,
        planId: pendingPolicy.plan_id,
        userId: pendingPolicy.plan.user_id,
        productId: pendingPolicy.plan.product_id,
        policyNumber,
      });

      // Use transaction to ensure data consistency
      const result = await this.policyModel.sequelize!.transaction(
        async (transaction: Transaction) => {
          // Create the policy
          const policy = await this.policyModel.create(
            {
              pending_policy_id: pending_policy_id,
              user_id: pendingPolicy.plan.user_id,
              plan_id: pendingPolicy.plan.id,
              policy_number: policyNumber,
            },
            { transaction },
          );

          this.logger.log('Policy created successfully', {
            policyId: policy.id,
            policyNumber: policy.policy_number,
            userId: policy.user_id,
            planId: policy.plan_id,
          });

          // Mark pending policy as used and soft delete it
          await pendingPolicy.update({ status: 'used' }, { transaction });
          this.logger.debug('Pending policy status updated to used', {
            pendingPolicyId: pending_policy_id,
          });

          await pendingPolicy.destroy({ transaction });
          this.logger.debug('Pending policy soft deleted', {
            pendingPolicyId: pending_policy_id,
          });

          return policy;
        },
      );

      this.logger.log('Policy activation transaction completed successfully', {
        policyId: result.id,
        policyNumber: result.policy_number,
        userId: result.user_id,
        planId: result.plan_id,
      });

      // Return the created policy with full details
      const policyResult = await this.findById(result.id);
      if (!policyResult) {
        this.logger.error('Failed to retrieve created policy after activation');
        throw new Error('Failed to retrieve created policy');
      }

      this.logger.log('Policy activation process completed successfully', {
        policyId: policyResult.id,
        policyNumber: policyResult.policy_number,
        userName: policyResult.user.name,
        productName: policyResult.plan.product.name,
        categoryName: policyResult.plan.product.category.name,
      });

      return policyResult;
    } catch (error) {
      this.logger.error('Failed to activate pending policy', {
        activateDto,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findAll(filters?: PolicyFilterDto): Promise<PolicyResponseDto[]> {
    this.logger.log('Fetching all activated policies', { filters });
    
    try {
      const whereClause: any = {};

      if (filters?.plan_id) {
        whereClause.plan_id = filters.plan_id;
        this.logger.debug('Applying plan filter', { planId: filters.plan_id });
      }

      const policies = await this.policyModel.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
          {
            model: Plan,
            as: 'plan',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
                include: [
                  {
                    model: ProductCategory,
                    as: 'category',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      this.logger.log(`Successfully fetched ${policies.length} policies`, {
        totalPolicies: policies.length,
        filteredByPlan: !!filters?.plan_id,
        planId: filters?.plan_id,
      });

      const result = policies.map((policy) => ({
        id: policy.id,
        pending_policy_id: policy.pending_policy_id,
        user_id: policy.user_id,
        plan_id: policy.plan_id,
        policy_number: policy.policy_number,
        user: {
          id: policy.user.id,
          name: policy.user.name,
        },
        plan: {
          id: policy.plan.id,
          product: {
            id: policy.plan.product.id,
            name: policy.plan.product.name,
            price: policy.plan.product.price,
            category: {
              id: policy.plan.product.category.id,
              name: policy.plan.product.category.name,
            },
          },
        },
        created_at: policy.created_at,
        updated_at: policy.updated_at,
      }));

      this.logger.debug('Policies data mapped successfully', {
        policyCount: result.length,
        policyNumbers: result.map(p => p.policy_number),
        userNames: [...new Set(result.map(p => p.user.name))],
        productCategories: [...new Set(result.map(p => p.plan.product.category.name))],
        totalValue: result.reduce((sum, policy) => sum + policy.plan.product.price, 0)
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch all policies', {
        filters,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findById(id: number): Promise<PolicyResponseDto | null> {
    this.logger.log(`Fetching policy by ID: ${id}`);
    
    try {
      const policy = await this.policyModel.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
          {
            model: Plan,
            as: 'plan',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
                include: [
                  {
                    model: ProductCategory,
                    as: 'category',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!policy) {
        this.logger.warn(`Policy with ID ${id} not found`);
        return null;
      }

      this.logger.log(`Successfully fetched policy: ${policy.policy_number} (ID: ${id})`);

      const result = {
        id: policy.id,
        pending_policy_id: policy.pending_policy_id,
        user_id: policy.user_id,
        plan_id: policy.plan_id,
        policy_number: policy.policy_number,
        user: {
          id: policy.user.id,
          name: policy.user.name,
        },
        plan: {
          id: policy.plan.id,
          product: {
            id: policy.plan.product.id,
            name: policy.plan.product.name,
            price: policy.plan.product.price,
            category: {
              id: policy.plan.product.category.id,
              name: policy.plan.product.category.name,
            },
          },
        },
        created_at: policy.created_at,
        updated_at: policy.updated_at,
      };

      this.logger.debug('Policy data mapped successfully', {
        policyId: result.id,
        policyNumber: result.policy_number,
        userName: result.user.name,
        productName: result.plan.product.name,
        categoryName: result.plan.product.category.name,
        price: result.plan.product.price
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch policy with ID ${id}`, {
        policyId: id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  private generatePolicyNumber(): string {
    // Generate a unique policy number with format: MCG-YYYYMMDD-XXXX
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    const policyNumber = `MCG-${year}${month}${day}-${random}`;
    
    this.logger.debug('Generated policy number', {
      policyNumber,
      timestamp: date.toISOString(),
      randomValue: random,
    });

    return policyNumber;
  }
}
