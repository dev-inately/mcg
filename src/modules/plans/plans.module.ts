import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import {
  Plan,
  User,
  Product,
  ProductCategory,
  PendingPolicy,
  Transaction,
  Wallet,
} from '../../models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Plan,
      User,
      Product,
      ProductCategory,
      PendingPolicy,
      Transaction,
      Wallet,
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
