import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import {
  User,
  ProductCategory,
  Product,
  Plan,
  PendingPolicy,
  Policy,
  Wallet,
  Transaction,
} from '../models';
import { seedInitialData } from '../database/seeds/initial-data.seed';
import { Dialect } from 'sequelize';

@Command({
  name: 'seed',
  description: 'Seed database with initial data',
})
export class SeedCommand extends CommandRunner {
  private readonly logger = new Logger(SeedCommand.name);

  constructor() {
    super();
  }

  @Option({
    flags: '-f, --force',
    description: 'Force reseed even if data exists',
  })
  parseForce(): boolean {
    return true;
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const forceReseed = options?.force || false;

    this.logger.log('Starting database seeding...');
    if (forceReseed) {
      this.logger.log('Force reseed enabled - will overwrite existing data');
    }
    this.logger.log('Starting database seeding...');

    try {
      // Initialize Sequelize connection
      this.logger.log('Initializing database connection...');
      const sequelize = new Sequelize({
        dialect: (process.env.DB_DIALECT as Dialect) || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'mac',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mycovergenius',
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
        logging: false,
      });

      await sequelize.authenticate();
      this.logger.log('Database connection established successfully');

      await sequelize.sync({ force: false });
      this.logger.log('Database models synchronized');

      const existingCategories = await ProductCategory.count();
      const existingUsers = await User.count();
      const existingProducts = await Product.count();

      if (existingCategories > 0 && !forceReseed) {
        this.logger.log(
          'Database already contains data, skipping seeding or use --force flag to reseed the database',
        );
        await sequelize.close();
        return;
      }

      if (forceReseed) {
        this.logger.log('Force reseed enabled - clearing existing data...');
        await sequelize.transaction(async (transaction) => {
          await Transaction.destroy({ where: {}, transaction });
          await Policy.destroy({ where: {}, transaction });
          await PendingPolicy.destroy({ where: {}, transaction });
          await Plan.destroy({ where: {}, transaction });
          await Wallet.destroy({ where: {}, transaction });
          await User.destroy({ where: {}, transaction });
          await Product.destroy({ where: {}, transaction });
          await ProductCategory.destroy({ where: {}, transaction });
        });
        this.logger.log('✅ Existing data cleared');
      }

      await seedInitialData(sequelize);
      this.logger.log('Database seeding completed successfully!');

      // Close connection
      await sequelize.close();
      this.logger.log('Database connection closed');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
      process.exit(1);
    }
  }
}
