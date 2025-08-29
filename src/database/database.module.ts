import { Module, Logger } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Dialect } from 'sequelize';
import {
  Transaction,
  Wallet,
  Policy,
  PendingPolicy,
  Plan,
  ProductCategory,
  Product,
  User,
} from '../models';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');

        const config = {
          dialect: ((configService.get('DB_DIALECT') as string) ||
            'postgres') as Dialect,
          autoLoadModels: true,
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
          port: parseInt(
            (configService.get('DB_PORT') as string) || '5432',
            10,
          ),
          host: (configService.get('DB_HOST') as string) || 'localhost',
          username: configService.get('DB_USERNAME') as string,
          password: configService.get('DB_PASSWORD') as string,
          database: configService.get('DB_NAME') as string,
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
        };

        // Always set PostgreSQL configuration (for both development and testing)

        logger.log('PostgreSQL development database configuration loaded', {
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
})
export class DatabaseModule {}
