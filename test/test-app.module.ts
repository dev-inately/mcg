import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { ProductsModule } from '../src/modules/products/products.module';
import { PlansModule } from '../src/modules/plans/plans.module';
import { PendingPoliciesModule } from '../src/modules/pending-policies/pending-policies.module';
import { PoliciesModule } from '../src/modules/policies/policies.module';
import { CommandModule } from '../src/command/command.module';
import {
  Transaction,
  Wallet,
  Policy,
  PendingPolicy,
  Plan,
  ProductCategory,
  Product,
  User,
} from '../src/models';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.test',
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: parseInt(configService.get('DB_PORT') || '5432', 10),
        username: configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('DB_PASSWORD') || 'postgres',
        database: configService.get('DB_NAME') || 'mycovergenius-test',
        autoLoadModels: true,
        synchronize: true,
        logging: false,
        models: [
          User,
          ProductCategory,
          Product,
          Plan,
          PendingPolicy,
          Policy,
          Wallet,
          Transaction,
        ],
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    PlansModule,
    PendingPoliciesModule,
    PoliciesModule,
    CommandModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestAppModule {}
