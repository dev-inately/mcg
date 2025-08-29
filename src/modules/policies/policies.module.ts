import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import {
  Policy,
  PendingPolicy,
  Plan,
  User,
  Product,
  ProductCategory,
} from '../../models';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Policy,
      PendingPolicy,
      Plan,
      User,
      Product,
      ProductCategory,
    ]),
  ],
  controllers: [PoliciesController],
  providers: [PoliciesService],
  exports: [PoliciesService],
})
export class PoliciesModule {}
