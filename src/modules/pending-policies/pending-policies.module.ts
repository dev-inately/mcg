import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PendingPoliciesController } from './pending-policies.controller';
import { PendingPoliciesService } from './pending-policies.service';
import { PendingPolicy, Plan, User, Product } from '../../models';

@Module({
  imports: [SequelizeModule.forFeature([PendingPolicy, Plan, User, Product])],
  controllers: [PendingPoliciesController],
  providers: [PendingPoliciesService],
  exports: [PendingPoliciesService],
})
export class PendingPoliciesModule {}
