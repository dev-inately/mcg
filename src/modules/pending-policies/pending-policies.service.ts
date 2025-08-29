import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { pick } from 'lodash';
import {
  PendingPolicy,
  Plan,
  User,
  Product,
  ProductCategory,
} from '../../models';
import { PendingPolicyResponseDto } from '../../dto/pending-policy.dto';

@Injectable()
export class PendingPoliciesService {
  private readonly logger = new Logger(PendingPoliciesService.name);

  constructor(
    @InjectModel(PendingPolicy)
    private readonly pendingPolicyModel: typeof PendingPolicy,
  ) {}

  async findByPlanId(planId: number): Promise<PendingPolicyResponseDto[]> {
    this.logger.log(`Fetching pending policies for plan ID: ${planId}`);

    try {
      const pendingPolicies = await this.pendingPolicyModel.findAll({
        where: { planId },
        include: [
          {
            model: Plan,
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
          },
        ],
        nest: true,
        raw: true,
        order: [['createdAt', 'ASC']],
      });

      this.logger.log(
        `Successfully fetched ${pendingPolicies.length} pending policies for plan ${planId}`,
      );

      const result = pendingPolicies.map((pendingPolicy) => ({
        ...pick(pendingPolicy, [
          'id',
          'status',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ]),
        plan: {
          id: pendingPolicy.plan.id,
          quantity: pendingPolicy.plan.quantity,
          totalAmount: pendingPolicy.plan.totalAmount,
          user: {
            id: pendingPolicy.plan.user.id,
            fullName: pendingPolicy.plan.user.fullName,
          },
          product: {
            id: pendingPolicy.plan.product.id,
            name: pendingPolicy.plan.product.name,
            price: pendingPolicy.plan.product.price,
          },
        },
      }));

      return result;
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch pending policies for plan ${planId}`, {
        planId,
        error: (error as Error).message,
        stack: (error as Error).stack,
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
          planId,
          status: 'unused', // or by deletedAt
        },
        include: [
          {
            model: Plan,
            as: 'plan',
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
              },
            ],
          },
        ],
        order: [['createdAt', 'ASC']],
        nest: true,
        raw: true,
      });

      this.logger.log(
        `Successfully fetched ${pendingPolicies.length} unused pending policies for plan ${planId}`,
      );

      const result = pendingPolicies.map((pendingPolicy) => ({
        ...pick(pendingPolicy, [
          'id',
          'status',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ]),
        plan: {
          id: pendingPolicy.plan.id,
          quantity: pendingPolicy.plan.quantity,
          totalAmount: pendingPolicy.plan.totalAmount,
          user: {
            id: pendingPolicy.plan.user.id,
            fullName: pendingPolicy.plan.user.fullName,
          },
          product: {
            id: pendingPolicy.plan.product.id,
            name: pendingPolicy.plan.product.name,
            price: pendingPolicy.plan.product.price,
          },
        },
      }));

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch unused pending policies for plan ${planId}`,
        {
          planId,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
      );
      throw error;
    }
  }
}
