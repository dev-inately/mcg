import { Module, Logger } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../models/user.model';
import { ProductCategory } from '../models/product-category.model';
import { Product } from '../models/product.model';
import { Plan } from '../models/plan.model';
import { PendingPolicy } from '../models/pending-policy.model';
import { Policy } from '../models/policy.model';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        
        const config = {
          dialect: configService.get('database.dialect'),
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          autoLoadModels: configService.get('database.autoLoadModels'),
          synchronize: configService.get('database.synchronize'),
          logging: configService.get('database.logging'),
          models: [User, ProductCategory, Product, Plan, PendingPolicy, Policy],
        };

        logger.log('Database configuration loaded', {
          host: config.host,
          port: config.port,
          database: config.database,
          dialect: config.dialect,
          synchronize: config.synchronize,
          autoLoadModels: config.autoLoadModels,
          modelCount: config.models.length,
        });

        return config;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SeederService],
})
export class DatabaseModule {}
