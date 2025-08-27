import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { Plan } from '../../models/plan.model';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { PendingPolicy } from '../../models/pending-policy.model';

@Module({
  imports: [SequelizeModule.forFeature([Plan, User, Product, PendingPolicy])],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
