import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PendingPoliciesController } from './pending-policies.controller';
import { PendingPoliciesService } from './pending-policies.service';
import { PendingPolicy } from '../../models/pending-policy.model';
import { Plan } from '../../models/plan.model';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';

@Module({
  imports: [SequelizeModule.forFeature([PendingPolicy, Plan, User, Product])],
  controllers: [PendingPoliciesController],
  providers: [PendingPoliciesService],
  exports: [PendingPoliciesService],
})
export class PendingPoliciesModule {}
