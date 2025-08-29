import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import {
  Plan,
  User,
  Product,
  ProductCategory,
  PendingPolicy,
  Transaction as TRX,
  Wallet,
} from '../../models';
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
    @InjectModel(TRX)
    private readonly transactionModel: typeof TRX,
  ) {}

  async createPlan(createPlanDto: CreatePlanDto): Promise<PlanResponseDto> {
    const { userId, productId, quantity } = createPlanDto;

    this.logger.log('Creating new plan', {
      userId,
      productId,
      quantity,
    });

    try {
      // Validate user exists
      const user = await this.userModel.findByPk(userId, {
        include: [
          { model: Wallet, as: 'wallet', attributes: ['id', 'walletBalance'] },
        ],
      });
      if (!user) {
        this.logger.warn(
          `User with ID ${userId} not found during plan creation`,
        );
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      if (!user.wallet) {
        this.logger.warn(`User with ID ${userId} has no wallet`);
        throw new BadRequestException(`User with ID ${userId} has no wallet`);
      }
      // Validate product exists
      const product = await this.productModel.findByPk(productId, {
        raw: true,
      });
      if (!product) {
        this.logger.warn(
          `Product with ID ${productId} not found during plan creation`,
        );
        throw new BadRequestException(`Product with ID ${productId} not found`);
      }

      // Calculate total amount
      const totalAmount = product.price * quantity;

      // Check if user has sufficient wallet balance
      if (user.wallet.walletBalance < totalAmount) {
        this.logger.warn('Insufficient wallet balance for plan creation', {
          userId: user.id,
          requiredAmount: totalAmount,
          availableBalance: user.wallet.walletBalance,
          shortfall: totalAmount - user.wallet.walletBalance,
        });
        throw new BadRequestException(
          `Insufficient wallet balance. Required: ${totalAmount}, Available: ${user.wallet.walletBalance}`,
        );
      }

      // From the clarification made, a user can actually have multiple plans for the same product
      // but they cannot have multiple active policies for the same product.
      // Check if user already has a policy for this product
      // const existingPlan = await this.planModel.findOne({
      //   where: { userId, productId },
      // });

      // if (existingPlan) {
      //   this.logger.warn('User already has a plan for this product', {
      //     userId: user.id,
      //     productId: product.id,
      //     existingPlanId: existingPlan.id,
      //   });
      //   throw new BadRequestException(
      //     `User already has a plan for this product. Only one policy per user per product is allowed.`,
      //   );
      // }

      // Use transaction to ensure data consistency
      const result = await this.planModel.sequelize!.transaction(
        async (transaction: Transaction) => {
          // Deduct amount from user's wallet
          const newBalance = user.wallet.walletBalance - totalAmount;
          await user.wallet.update(
            { walletBalance: newBalance },
            { transaction },
          );

          // Create the plan
          const plan = await this.planModel.create(
            {
              userId,
              productId,
              quantity,
              totalAmount,
            },
            { transaction },
          );

          // Create pending policies (slots) based on quantity

          const pendingPolicies = await this.pendingPolicyModel.bulkCreate(
            Array.from({ length: quantity }, () => ({
              planId: plan.id,
              status: 'unused',
            })),
            { transaction },
          );

          const trx = await this.transactionModel.create(
            {
              planId: plan.id,
              amount: totalAmount,
              userId,
              walletId: user.wallet.id,
            },
            { transaction },
          );

          return { plan, pendingPolicies, trx };
        },
      );

      this.logger.log('Plan creation transaction completed successfully', {
        planId: result.plan.id,
        userId: result.plan.userId,
        productId: result.plan.productId,
        quantity: result.plan.quantity,
        totalAmount: result.plan.totalAmount,
        transactionId: result.trx.id,
      });

      return {
        ...result.plan.dataValues,
        user: user.dataValues,
        product: product.dataValues,
      };
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
            attributes: ['id', 'fullName'],
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
        raw: true,
        nest: true,
      });

      if (!plan) {
        this.logger.warn(`Plan with ID ${id} not found`);
        return null;
      }

      this.logger.log(
        `Successfully fetched plan: ID ${id} for user ${plan.user.fullName}`,
      );

      return plan;
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
    this.logger.log(`Fetching plans for user ID: ${userId}`);

    try {
      // Check if user exists
      const user = await this.userModel.findByPk(userId, {
        raw: true,
        attributes: ['id'],
      });
      if (!user) {
        this.logger.warn(`User with ID ${userId} not found`);
        throw new BadRequestException(`User with ID ${userId} not found`);
      }
      const plans = await this.planModel.findAll({
        where: { userId },
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
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
        order: [['createdAt', 'ASC']],
        nest: true,
        raw: true,
      });

      this.logger.log(
        `Successfully fetched ${plans.length} plans for user ${userId}`,
      );

      return plans;
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
