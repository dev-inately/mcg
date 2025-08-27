import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
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
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectModel(Plan)
    private readonly planModel: typeof Plan,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    @InjectModel(ProductCategory)
    private readonly productCategoryModel: typeof ProductCategory,
    @InjectModel(PendingPolicy)
    private readonly pendingPolicyModel: typeof PendingPolicy,
  ) {}

  async createPlan(createPlanDto: CreatePlanDto): Promise<PlanResponseDto> {
    const { user_id, product_id, quantity } = createPlanDto;
    
    this.logger.log('Creating new plan', {
      userId: user_id,
      productId: product_id,
      quantity,
    });

    try {
      // Validate user exists
      const user = await this.userModel.findByPk(user_id);
      if (!user) {
        this.logger.warn(`User with ID ${user_id} not found during plan creation`);
        throw new NotFoundException(`User with ID ${user_id} not found`);
      }

      this.logger.debug('User validation passed', {
        userId: user.id,
        userName: user.name,
        currentWalletBalance: user.wallet_balance,
      });

      // Validate product exists
      const product = await this.productModel.findByPk(product_id);
      if (!product) {
        this.logger.warn(`Product with ID ${product_id} not found during plan creation`);
        throw new NotFoundException(`Product with ID ${product_id} not found`);
      }

      this.logger.debug('Product validation passed', {
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productCategory: product.category_id,
      });

      // Calculate total amount
      const totalAmount = product.price * quantity;
      this.logger.log('Plan cost calculation', {
        unitPrice: product.price,
        quantity,
        totalAmount,
      });

      // Check if user has sufficient wallet balance
      if (user.wallet_balance < totalAmount) {
        this.logger.warn('Insufficient wallet balance for plan creation', {
          userId: user.id,
          requiredAmount: totalAmount,
          availableBalance: user.wallet_balance,
          shortfall: totalAmount - user.wallet_balance,
        });
        throw new BadRequestException(
          `Insufficient wallet balance. Required: ${totalAmount}, Available: ${user.wallet_balance}`,
        );
      }

      // Check if user already has a policy for this product
      const existingPlan = await this.planModel.findOne({
        where: { user_id, product_id },
      });

      if (existingPlan) {
        this.logger.warn('User already has a plan for this product', {
          userId: user.id,
          productId: product.id,
          existingPlanId: existingPlan.id,
        });
        throw new BadRequestException(
          `User already has a plan for this product. Only one policy per user per product is allowed.`,
        );
      }

      this.logger.log('Starting plan creation transaction', {
        userId: user.id,
        productId: product.id,
        quantity,
        totalAmount,
      });

      // Use transaction to ensure data consistency
      const result = await this.planModel.sequelize!.transaction(
        async (transaction: Transaction) => {
          // Deduct amount from user's wallet
          const newBalance = user.wallet_balance - totalAmount;
          await user.update(
            { wallet_balance: newBalance },
            { transaction },
          );

          this.logger.log('Wallet balance updated', {
            userId: user.id,
            oldBalance: user.wallet_balance,
            newBalance,
            deductedAmount: totalAmount,
          });

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

          this.logger.log('Plan created successfully', {
            planId: plan.id,
            userId: plan.user_id,
            productId: plan.product_id,
            quantity: plan.quantity,
            totalAmount: plan.total_amount,
          });

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

          this.logger.log('Pending policies created', {
            planId: plan.id,
            pendingPolicyCount: pendingPolicies.length,
            pendingPolicyIds: pendingPolicies.map(p => p.id),
          });

          return plan;
        },
      );

      this.logger.log('Plan creation transaction completed successfully', {
        planId: result.id,
        userId: result.user_id,
        productId: result.product_id,
        quantity: result.quantity,
        totalAmount: result.total_amount,
      });

      // Return the created plan with full details
      const planResult = await this.findById(result.id);
      if (!planResult) {
        this.logger.error('Failed to retrieve created plan after creation');
        throw new Error('Failed to retrieve created plan');
      }

      this.logger.log('Plan creation process completed successfully', {
        planId: planResult.id,
        userName: planResult.user.name,
        productName: planResult.product.name,
        quantity: planResult.quantity,
        totalAmount: planResult.total_amount,
      });

      return planResult;
    } catch (error) {
      this.logger.error('Failed to create plan', {
        createPlanDto,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findById(id: number): Promise<PlanResponseDto | null> {
    this.logger.log(`Fetching plan by ID: ${id}`);
    
    try {
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
        this.logger.warn(`Plan with ID ${id} not found`);
        return null;
      }

      this.logger.log(`Successfully fetched plan: ID ${id} for user ${plan.user.name}`);

      const result = {
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

      this.logger.debug('Plan data mapped successfully', {
        planId: result.id,
        userName: result.user.name,
        productName: result.product.name,
        quantity: result.quantity,
        totalAmount: result.total_amount,
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch plan with ID ${id}`, {
        planId: id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<PlanResponseDto[]> {
    this.logger.log(`Fetching all plans for user ID: ${userId}`);
    
    try {
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

      this.logger.log(`Successfully fetched ${plans.length} plans for user ${userId}`);

      const result = plans.map((plan) => ({
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

      this.logger.debug('User plans data mapped successfully', {
        userId,
        planCount: result.length,
        totalSpent: result.reduce((sum, plan) => sum + plan.total_amount, 0),
        productCategories: [...new Set(result.map(p => p.product.category.name))]
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch plans for user ${userId}`, {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
