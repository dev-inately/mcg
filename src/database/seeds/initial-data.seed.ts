import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../models/user.model';
import { ProductCategory } from '../../models/product-category.model';
import { Product } from '../../models/product.model';
import { Wallet } from '../../models/wallet.model';

const logger = new Logger('InitialDataSeed');

export async function seedInitialData(sequelize: Sequelize) {
  try {
    logger.log('Starting initial data seeding...');

    // Create Product Categories
    logger.log('Creating product categories...');

    const productsCategories = await ProductCategory.bulkCreate([
      {
        name: 'Health Insurance',
        description: 'Comprehensive health insurance products',
      },
      {
        name: 'Auto Insurance',
        description: 'Automotive insurance products',
      },
    ]);
    logger.log('Product categories created', {
      productsCategories: productsCategories.map((pc) => pc.name),
    });

    // Create Products
    logger.log('Creating insurance products...');

    const products = await Product.bulkCreate([
      {
        name: 'Optimal Care Mini',
        price: 10000.0,
        categoryId: productsCategories[0].id,
      },
      {
        name: 'Optimal Care Standard',
        price: 20000.0,
        categoryId: productsCategories[0].id,
      },

      {
        name: 'Third-Party',
        price: 5000.0,
        categoryId: productsCategories[1].id,
      },

      {
        name: 'Comprehensive',
        price: 15000.0,
        categoryId: productsCategories[1].id,
      },
    ]);

    logger.log('Products created', {
      products: products.map((p) => p.name),
    });

    // const optimalCareMini = await Product.create({
    //   name: 'Optimal Care Mini',
    //   price: 10000.0,
    //   categoryId: healthCategory.id,
    // });
    // logger.log('Optimal Care Mini product created', {
    //   productId: optimalCareMini.id,
    //   name: optimalCareMini.name,
    //   price: optimalCareMini.price,
    //   categoryId: optimalCareMini.categoryId,
    // });

    // const optimalCareStandard = await Product.create({
    //   name: 'Optimal Care Standard',
    //   price: 20000.0,
    //   categoryId: healthCategory.id,
    // });
    // logger.log('Optimal Care Standard product created', {
    //   productId: optimalCareStandard.id,
    //   name: optimalCareStandard.name,
    //   price: optimalCareStandard.price,
    //   categoryId: optimalCareStandard.categoryId,
    // });

    // const thirdParty = await Product.create({
    //   name: 'Third-Party',
    //   price: 5000.0,
    //   categoryId: autoCategory.id,
    // });
    // logger.log('Third-Party product created', {
    //   productId: thirdParty.id,
    //   name: thirdParty.name,
    //   price: thirdParty.price,
    //   categoryId: thirdParty.categoryId,
    // });

    // const comprehensive = await Product.create({
    //   name: 'Comprehensive',
    //   price: 15000.0,
    //   categoryId: autoCategory.id,
    // });
    // logger.log('Comprehensive product created', {
    //   productId: comprehensive.id,
    //   name: comprehensive.name,
    //   price: comprehensive.price,
    //   categoryId: comprehensive.categoryId,
    // });

    // Create Sample Users

    logger.log('Creating sample users...');

    // Use transaction to create user and their wallet
    const userCreation = await sequelize.transaction(async (transaction) => {
      const users = await User.bulkCreate(
        [
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
        ],
        { transaction },
      );

      await Wallet.bulkCreate(
        [
          {
            userId: users[0].id,
            walletBalance: 50000.0,
          },
          {
            userId: users[1].id,
            walletBalance: 75000.0,
          },
        ],
        { transaction },
      );
      logger.log(
        `Users created successfully. \n ${users.map(
          (user) =>
            `User: ${user.fullName} - ${user.email} - ${user.phoneNumber}`,
        )}`,
      );
      return users;
    });

    // const bobJohnson = await User.create({
    //   fullName: 'Bob Johnson',
    //   email: 'bob.johnson@example.com',
    //   phoneNumber: '+1234567892',
    // });
    // logger.log('Bob Johnson user created', {
    //   userId: bobJohnson.id,
    //   fullName: bobJohnson.fullName,
    //   email: bobJohnson.email,
    // });

    // // Create Wallets for Users
    // logger.log('Creating wallets for users...');

    // await Wallet.create({
    //   userId: johnDoe.id,
    //   walletBalance: 100000.0,
    // });
    // logger.log('John Doe wallet created', {
    //   userId: johnDoe.id,
    //   walletBalance: 100000.0,
    // });

    // await Wallet.create({
    //   userId: janeSmith.id,
    //   walletBalance: 75000.0,
    // });
    // logger.log('Jane Smith wallet created', {
    //   userId: janeSmith.id,
    //   walletBalance: 75000.0,
    // });

    // await Wallet.create({
    //   userId: bobJohnson.id,
    //   walletBalance: 50000.0,
    // });
    // logger.log('Bob Johnson wallet created', {
    //   userId: bobJohnson.id,
    //   walletBalance: 50000.0,
    // });
  } catch (error) {
    logger.error('Error seeding initial data', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
