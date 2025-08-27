import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Plan } from '../../models/plan.model';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';
import { PendingPolicy } from '../../models/pending-policy.model';
import { CreatePlanDto, PlanResponseDto } from '../../dto/plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan)
    private readonly planModel: typeof Plan,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    @InjectModel(PendingPolicy)
    private readonly pendingPolicyModel: typeof PendingPolicy,
  ) {}

  async createPlan(createPlanDto: CreatePlanDto): Promise<PlanResponseDto> {
    const { user_id, product_id, quantity } = createPlanDto;

    // Validate user exists
    const user = await this.userModel.findByPk(user_id);
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    // Validate product exists
    const product = await this.productModel.findByPk(product_id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${product_id} not found`);
    }

    // Calculate total amount
    const totalAmount = product.price * quantity;

    // Check if user has sufficient wallet balance
    if (user.wallet_balance < totalAmount) {
      throw new BadRequestException(
        `Insufficient wallet balance. Required: ${totalAmount}, Available: ${user.wallet_balance}`,
      );
    }

    // Check if user already has a policy for this product
    const existingPlan = await this.planModel.findOne({
      where: { user_id, product_id },
    });

    if (existingPlan) {
      throw new BadRequestException(
        `User already has a plan for this product. Only one policy per user per product is allowed.`,
      );
    }

    // Use transaction to ensure data consistency
    const result = await this.planModel.sequelize!.transaction(
      async (transaction: Transaction) => {
        // Deduct amount from user's wallet
        await user.update(
          { wallet_balance: user.wallet_balance - totalAmount },
          { transaction },
        );

        // Create the plan
        const plan = await this.planModel.create(
          {
            user_id,
            product_id,
            quantity,
            total_amount: totalAmount,
          },
          { transaction },
        );

        // Create pending policies (slots) based on quantity
        const pendingPolicies: PendingPolicy[] = [];
        for (let i = 0; i < quantity; i++) {
          const pendingPolicy = await this.pendingPolicyModel.create(
            {
              plan_id: plan.id,
              status: 'unused',
            },
            { transaction },
          );
          pendingPolicies.push(pendingPolicy);
        }

        return plan;
      },
    );

    // Return the created plan with full details
    const planResult = await this.findById(result.id);
    if (!planResult) {
      throw new Error('Failed to retrieve created plan');
    }
    return planResult;
  }

  async findById(id: number): Promise<PlanResponseDto | null> {
    const plan = await this.planModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'wallet_balance'],
        },
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
    });

    if (!plan) {
      return null;
    }

    return {
      id: plan.id,
      user_id: plan.user_id,
      product_id: plan.product_id,
      quantity: plan.quantity,
      total_amount: plan.total_amount,
      user: {
        id: plan.user.id,
        name: plan.user.name,
        wallet_balance: plan.user.wallet_balance,
      },
      product: {
        id: plan.product.id,
        name: plan.product.name,
        price: plan.product.price,
        category: {
          id: plan.product.category.id,
          name: plan.product.category.name,
        },
      },
      created_at: plan.created_at,
      updated_at: plan.updated_at,
    };
  }

  async findByUserId(userId: number): Promise<PlanResponseDto[]> {
    const plans = await this.planModel.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'wallet_balance'],
        },
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
      order: [['created_at', 'DESC']],
    });

    return plans.map(plan => ({
      id: plan.id,
      user_id: plan.user_id,
      product_id: plan.product_id,
      quantity: plan.quantity,
      total_amount: plan.total_amount,
      user: {
        id: plan.user.id,
        name: plan.user.name,
        wallet_balance: plan.user.wallet_balance,
      },
      product: {
        id: plan.product.id,
        name: plan.product.name,
        price: plan.product.price,
        category: {
          id: plan.product.category.id,
          name: plan.product.category.name,
        },
      },
      created_at: plan.created_at,
      updated_at: plan.updated_at,
    }));
  }
}
