import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../src/models/user.model';
import { ProductCategory } from '../src/models/product-category.model';
import { Product } from '../src/models/product.model';
import { Wallet } from '../src/models/wallet.model';
import { Plan } from '../src/models/plan.model';
import { PendingPolicy } from '../src/models/pending-policy.model';

const logger = new Logger('TestSeed');

export async function seedTestData(sequelize: Sequelize) {
  try {
    logger.log('Starting test data seeding...');

    // Check if data already exists
    const existingCategories = await ProductCategory.count();
    const existingUsers = await User.count();

    if (existingCategories > 0 && existingUsers > 0) {
      logger.log('Test data already exists, skipping seeding');
      return;
    }

    // Create Product Categories only if they don't exist
    if (existingCategories === 0) {
      logger.log('Creating product categories...');
      await ProductCategory.bulkCreate([
        {
          name: 'Health Insurance',
          description: 'Comprehensive health insurance products',
        },
        {
          name: 'Auto Insurance',
          description: 'Automotive insurance products',
        },
      ]);
      logger.log('Product categories created');
    }

    // Create Products only if they don't exist
    if (existingCategories > 0) {
      const healthCategory = await ProductCategory.findOne({
        where: { name: 'Health Insurance' },
      });
      const autoCategory = await ProductCategory.findOne({
        where: { name: 'Auto Insurance' },
      });

      if (healthCategory && autoCategory) {
        const existingProducts = await Product.count();
        if (existingProducts === 0) {
          logger.log('Creating insurance products...');
          await Product.bulkCreate([
            {
              name: 'Optimal Care Mini',
              price: 10000.0,
              categoryId: healthCategory.id,
            },
            {
              name: 'Optimal Care Standard',
              price: 20000.0,
              categoryId: healthCategory.id,
            },
            {
              name: 'Third-Party',
              price: 5000.0,
              categoryId: autoCategory.id,
            },
            {
              name: 'Comprehensive',
              price: 15000.0,
              categoryId: autoCategory.id,
            },
          ]);
          logger.log('Products created');
        }
      }
    }

    // Create Sample Users only if they don't exist
    if (existingUsers === 0) {
      logger.log('Creating sample users...');
      const users = await User.bulkCreate([
        {
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890',
        },
        {
          fullName: 'Jane Smith',
          email: 'jane.smith@example.com',
          phoneNumber: '+1234567891',
        },
      ]);

      await Wallet.bulkCreate([
        {
          userId: users[0].id,
          walletBalance: 50000.0,
        },
        {
          userId: users[1].id,
          walletBalance: 75000.0,
        },
      ]);
      logger.log('Users and wallets created successfully');

      // Create a plan for the first user
      const healthProduct = await Product.findOne({
        where: { name: 'Optimal Care Mini' },
      });

      if (healthProduct) {
        const plan = await Plan.create({
          userId: users[0].id,
          productId: healthProduct.id,
          quantity: 1,
          totalAmount: healthProduct.price,
        });

        // Create pending policies for the plan
        await PendingPolicy.bulkCreate([
          {
            planId: plan.id,
            isUsed: false,
          },
          {
            planId: plan.id,
            isUsed: false,
          },
        ]);

        logger.log('Plan and pending policies created successfully');
      }
    }

    logger.log('Test data seeding completed');
  } catch (error) {
    logger.error('Error seeding test data', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
