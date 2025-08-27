import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async activatePendingPolicy(activateDto: ActivatePendingPolicyDto): Promise<PolicyResponseDto> {
    const { pending_policy_id } = activateDto;

    // Find the pending policy
    const pendingPolicy = await this.pendingPolicyModel.findByPk(pending_policy_id, {
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
    });

    if (!pendingPolicy) {
      throw new NotFoundException(`Pending policy with ID ${pending_policy_id} not found`);
    }

    if (pendingPolicy.status === 'used') {
      throw new BadRequestException('This pending policy has already been used');
    }

    // Check if user already has a policy for this plan
    const existingPolicy = await this.policyModel.findOne({
      where: { 
        user_id: pendingPolicy.plan.user_id,
        plan_id: pendingPolicy.plan.id
      },
    });

    if (existingPolicy) {
      throw new BadRequestException(
        'User already has a policy for this plan. Only one policy per user per plan is allowed.',
      );
    }

    // Generate unique policy number
    const policyNumber = this.generatePolicyNumber();

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

        // Mark pending policy as used and soft delete it
        await pendingPolicy.update({ status: 'used' }, { transaction });
        await pendingPolicy.destroy({ transaction });

        return policy;
      },
    );

    // Return the created policy with full details
    const policyResult = await this.findById(result.id);
    if (!policyResult) {
      throw new Error('Failed to retrieve created policy');
    }
    return policyResult;
  }

  async findAll(filters?: PolicyFilterDto): Promise<PolicyResponseDto[]> {
    const whereClause: any = {};
    
    if (filters?.plan_id) {
      whereClause.plan_id = filters.plan_id;
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

    return policies.map(policy => ({
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
  }

  async findById(id: number): Promise<PolicyResponseDto | null> {
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
      return null;
    }

    return {
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
  }

  private generatePolicyNumber(): string {
    // Generate a unique policy number with format: MCG-YYYYMMDD-XXXX
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `MCG-${year}${month}${day}-${random}`;
  }
}
