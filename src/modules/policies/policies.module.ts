import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import { Policy } from '../../models/policy.model';
import { PendingPolicy } from '../../models/pending-policy.model';
import { Plan } from '../../models/plan.model';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { ProductCategory } from '../../models/product-category.model';

@Module({
  imports: [SequelizeModule.forFeature([Policy, PendingPolicy, Plan, User, Product, ProductCategory])],
  controllers: [PoliciesController],
  providers: [PoliciesService],
  exports: [PoliciesService],
})
export class PoliciesModule {}
