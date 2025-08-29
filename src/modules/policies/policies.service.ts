import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { pick } from 'lodash';
import { Transaction } from 'sequelize';
import {
  Policy,
  PendingPolicy,
  Plan,
  User,
  Product,
  ProductCategory,
} from '../../models';
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
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}
  async activatePendingPolicy(
    activateDto: ActivatePendingPolicyDto,
  ): Promise<PolicyResponseDto> {
    const { pendingPolicyId, userId } = activateDto;

    this.logger.log('Activating pending policy', {
      pendingPolicyId,
      userId,
    });

    try {
      // Find the pending policy
      const pendingPolicy = await this.pendingPolicyModel.findByPk(
        pendingPolicyId,
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
                  include: [
                    {
                      model: ProductCategory,
                      as: 'category',
                      attributes: ['name'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      );

      if (!pendingPolicy) {
        this.logger.warn(
          `Pending policy with ID ${pendingPolicyId} not found during activation`,
        );
        throw new BadRequestException(
          `Pending policy with ID ${pendingPolicyId} not found`,
        );
      }

      if (pendingPolicy.status === 'used') {
        this.logger.warn('Attempted to activate already used pending policy', {
          pendingPolicyId,
          planId: pendingPolicy.planId,
        });
        throw new BadRequestException(
          'This pending policy has already been used',
        );
      }

      if (userId) {
        const user = await this.userModel.findByPk(userId, { raw: true });
        if (!user) {
          throw new BadRequestException(
            'The user you are trying to buy a policy for is not found',
          );
        }
      }

      // Check if user already has a policy for this plan
      const existingPolicy = await this.policyModel.findOne({
        where: {
          userId: userId || pendingPolicy.plan.userId,
          policyTypeId: pendingPolicy.plan.productId,
        },
      });

      if (existingPolicy) {
        this.logger.warn('User already has a policy for this plan', {
          userId: pendingPolicy.plan.userId,
          planId: pendingPolicy.plan.id,
          existingPolicyId: existingPolicy.id,
        });
        throw new BadRequestException(
          'User already has a policy for this plan. Only one policy per user per plan is allowed.',
        );
      }

      // Generate unique policy number
      const policyNumber = this.generatePolicyNumber(
        pendingPolicy.plan.product.name,
      );
      this.logger.log('Generated policy number', { policyNumber });

      // Use transaction to ensure data consistency
      const result = await this.policyModel.sequelize!.transaction(
        async (transaction: Transaction) => {
          // Create the policy
          const policy = await this.policyModel.create(
            {
              policyTypeId: pendingPolicy.plan.productId,
              userId: userId || pendingPolicy.plan.userId,
              planId: pendingPolicy.plan.id,
              policyNumber,
            },
            { transaction },
          );

          // Mark pending policy as used and soft delete it
          await pendingPolicy.update({ status: 'used' }, { transaction });
          await pendingPolicy.destroy({ transaction });

          return policy;
        },
      );

      this.logger.log('Policy activation transaction completed successfully', {
        policyId: result.id,
        policyNumber: result.policyNumber,
        userId: result.userId,
        planId: result.planId,
      });

      return {
        ...pick(result, [
          'id',
          'policyNumber',
          'planId',
          'createdAt',
          'updatedAt',
        ]),
        userId: userId || pendingPolicy.plan.userId,
        product: {
          ...pick(pendingPolicy.plan.product, ['id', 'name', 'price']),
          category: pick(pendingPolicy.plan.product.category, ['name']),
        },
      };
    } catch (error: unknown) {
      this.logger.error('Failed to activate pending policy', {
        activateDto,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      throw error;
    }
  }

  async findAll(filters?: PolicyFilterDto): Promise<PolicyResponseDto[]> {
    this.logger.log('Fetching all activated policies', { filters });

    try {
      const whereClause: { planId?: number } = {};

      if (filters?.planId !== undefined) {
        whereClause.planId = filters.planId;
      }

      const policies = await this.policyModel.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email'],
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price'],
            include: [
              {
                model: ProductCategory,
                as: 'category',
                attributes: ['name'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        nest: true,
        raw: true,
      });

      this.logger.log(`Successfully fetched ${policies.length} policies`, {
        totalPolicies: policies.length,
        filteredByPlan: !!filters?.planId,
        planId: filters?.planId,
      });
      const result = policies.map((policy) => ({
        ...pick(policy, [
          'id',
          'policyNumber',
          'userId',
          'planId',
          'createdAt',
          'updatedAt',
        ]),
        user: {
          ...pick(policy.user, ['id', 'fullName', 'email']),
        },
        product: {
          ...pick(policy.product, ['id', 'name', 'price']),
          category: {
            ...pick(policy.product.category, ['name']),
          },
        },
      }));

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch all policies', {
        filters,
        error: (error as Error).message,
        stack: (error as Error).stack,
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
            attributes: ['id', 'fullName', 'email'],
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price'],
            include: [
              {
                model: ProductCategory,
                as: 'category',
                attributes: ['name'],
              },
            ],
          },
        ],
      });

      if (!policy) {
        this.logger.warn(`Policy with ID ${id} not found`);
        return null;
      }

      this.logger.log(
        `Successfully fetched policy: ${policy.policyNumber} (ID: ${id})`,
      );

      const result = {
        ...pick(policy, [
          'id',
          'policyNumber',
          'userId',
          'planId',
          'createdAt',
          'updatedAt',
        ]),
        user: pick(policy.user, ['id', 'fullName', 'email']),
        product: {
          ...pick(policy.product, ['id', 'name', 'price']),
          category: {
            ...pick(policy.product.category, ['name']),
          },
        },
      };

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch policy with ID ${id}`, {
        policyId: id,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      throw error;
    }
  }

  private generatePolicyNumber(productName: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `POL-${productName.slice(0, 3).toUpperCase()}-${timestamp}-${random}`;
  }
}
