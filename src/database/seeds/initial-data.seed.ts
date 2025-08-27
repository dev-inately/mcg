import { Logger } from '@nestjs/common';
import { ProductCategory } from '../../models/product-category.model';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';

const logger = new Logger('InitialDataSeed');

export async function seedInitialData() {
  logger.log('Starting initial data seeding...');
  
  try {
    // Create Product Categories
    logger.log('Creating product categories...');
    const healthCategory = await ProductCategory.create({
      name: 'Health',
      description: 'Health insurance products',
    });
    logger.log('Health category created', { categoryId: healthCategory.id, name: healthCategory.name });

    const autoCategory = await ProductCategory.create({
      name: 'Auto',
      description: 'Auto insurance products',
    });
    logger.log('Auto category created', { categoryId: autoCategory.id, name: autoCategory.name });

    // Create Products
    logger.log('Creating insurance products...');
    
    const optimalCareMini = await Product.create({
      name: 'Optimal Care Mini',
      price: 10000.0,
      category_id: healthCategory.id,
    });
    logger.log('Optimal Care Mini product created', { 
      productId: optimalCareMini.id, 
      name: optimalCareMini.name, 
      price: optimalCareMini.price,
      categoryId: optimalCareMini.category_id
    });

    const optimalCareStandard = await Product.create({
      name: 'Optimal Care Standard',
      price: 20000.0,
      category_id: healthCategory.id,
    });
    logger.log('Optimal Care Standard product created', { 
      productId: optimalCareStandard.id, 
      name: optimalCareStandard.name, 
      price: optimalCareStandard.price,
      categoryId: optimalCareStandard.category_id
    });

    const thirdParty = await Product.create({
      name: 'Third-Party',
      price: 5000.0,
      category_id: autoCategory.id,
    });
    logger.log('Third-Party product created', { 
      productId: thirdParty.id, 
      name: thirdParty.name, 
      price: thirdParty.price,
      categoryId: thirdParty.category_id
    });

    const comprehensive = await Product.create({
      name: 'Comprehensive',
      price: 15000.0,
      category_id: autoCategory.id,
    });
    logger.log('Comprehensive product created', { 
      productId: comprehensive.id, 
      name: comprehensive.name, 
      price: comprehensive.price,
      categoryId: comprehensive.category_id
    });

    // Create Sample Users
    logger.log('Creating sample users...');
    
    const johnDoe = await User.create({
      name: 'John Doe',
      wallet_balance: 100000.0,
    });
    logger.log('John Doe user created', { 
      userId: johnDoe.id, 
      name: johnDoe.name, 
      walletBalance: johnDoe.wallet_balance
    });

    const janeSmith = await User.create({
      name: 'Jane Smith',
      wallet_balance: 75000.0,
    });
    logger.log('Jane Smith user created', { 
      userId: janeSmith.id, 
      name: janeSmith.name, 
      walletBalance: janeSmith.wallet_balance
    });

    const bobJohnson = await User.create({
      name: 'Bob Johnson',
      wallet_balance: 50000.0,
    });
    logger.log('Bob Johnson user created', { 
      userId: bobJohnson.id, 
      name: bobJohnson.name, 
      walletBalance: bobJohnson.wallet_balance
    });

    logger.log('Initial data seeding completed successfully', {
      categoriesCreated: 2,
      productsCreated: 4,
      usersCreated: 3,
      totalProductValue: 50000.0,
      totalUserWalletBalance: 225000.0
    });
  } catch (error) {
    logger.error('Error seeding initial data', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
