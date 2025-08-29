import { Sequelize } from 'sequelize-typescript';
import {
  User,
  Wallet,
  ProductCategory,
  Product,
  Plan,
  PendingPolicy,
  Policy,
  Transaction,
} from '../src/models';

export interface TestData {
  users: User[];
  wallets: Wallet[];
  categories: ProductCategory[];
  products: Product[];
  plans: Plan[];
  pendingPolicies: PendingPolicy[];
  policies: Policy[];
  transactions: Transaction[];
}

export async function seedTestDatabase(
  sequelize: Sequelize,
): Promise<TestData> {
  // Clear all tables first
  await clearTestDatabase(sequelize);

  // Get models from sequelize instance
  const {
    User,
    Wallet,
    ProductCategory,
    Product,
    Plan,
    PendingPolicy,
    Transaction,
  } = sequelize.models;

  // Create users
  const users = await User.bulkCreate(
    [
      {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
      },
      {
        id: 2,
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567891',
        address: '456 Oak Ave',
      },
    ],
    { returning: true },
  );

  // Create wallets for users
  const wallets = await Wallet.bulkCreate(
    [
      {
        id: 1,
        userId: 1,
        walletBalance: 1000,
      },
      {
        id: 2,
        userId: 2,
        walletBalance: 550,
      },
    ],
    { returning: true },
  );

  // Create product categories
  const categories = await ProductCategory.bulkCreate(
    [
      {
        id: 1,
        name: 'Health Insurance',
        description: 'Health and medical coverage',
      },
      {
        id: 2,
        name: 'Auto Insurance',
        description: 'Vehicle coverage',
      },
    ],
    { returning: true },
  );

  // Create products
  const products = await Product.bulkCreate(
    [
      {
        id: 1,
        name: 'Basic Health Plan',
        description: 'Basic health coverage',
        price: 100,
        categoryId: 1,
      },
      {
        id: 2,
        name: 'Premium Health Plan',
        description: 'Premium health coverage',
        price: 200,
        categoryId: 1,
      },
      {
        id: 3,
        name: 'Car Insurance',
        description: 'Auto coverage',
        price: 150,
        categoryId: 2,
      },
    ],
    { returning: true },
  );

  // Create some test plans
  const plans = await Plan.bulkCreate(
    [
      {
        userId: 1,
        productId: 1,
        quantity: 2,
        totalAmount: 200,
      },
    ],
    { returning: true },
  );

  // Create pending policies
  const pendingPolicies = await PendingPolicy.bulkCreate(
    [
      {
        planId: 1,
        status: 'unused',
      },
      {
        planId: 1,
        status: 'unused',
      },
    ],
    { returning: true },
  );

  // Create a transaction
  const transactions = await Transaction.bulkCreate(
    [
      {
        planId: 1,
        amount: 200,
        userId: 1,
        walletId: 1,
      },
    ],
    { returning: true },
  );

  const policies: any[] = [];

  return {
    users,
    wallets,
    categories,
    products,
    plans,
    pendingPolicies,
    policies,
    transactions,
  };
}

export async function clearTestDatabase(sequelize: Sequelize): Promise<void> {
  if (!sequelize || !sequelize.models) {
    console.warn('Sequelize instance or models not available during cleanup');
    return;
  }

  try {
    // Delete in correct order to respect foreign keys
    // Use sequelize.models to get the models from the connection
    const {
      Policy,
      PendingPolicy,
      Transaction,
      Plan,
      Product,
      ProductCategory,
      Wallet,
      User,
    } = sequelize.models;

    if (Policy)
      await Policy.destroy({
        where: {},
        force: true,
        truncate: true,
        cascade: true,
      });
    if (PendingPolicy)
      await PendingPolicy.destroy({
        where: {},
        force: true,
        truncate: true,
        cascade: true,
      });
    if (Transaction)
      await Transaction.destroy({
        where: {},
        force: true,
        truncate: true,
        cascade: true,
      });
    if (Plan)
      await Plan.destroy({
        where: {},
        force: true,
        truncate: true,
        cascade: true,
      });
    if (Product)
      await Product.destroy({
        where: {},
        force: true,
        truncate: true,
        cascade: true,
      });
    if (ProductCategory)
      await ProductCategory.destroy({
        where: {},
        force: true,
        truncate: true,
        cascade: true,
      });
    if (Wallet)
      await Wallet.destroy({
        where: {},
        force: true,
        truncate: true,
        cascade: true,
      });
    if (User)
      await User.destroy({
        where: {},
        force: true,
        truncate: true,
        cascade: true,
      });
  } catch (error: unknown) {
    console.error('Error clearing test database:', error);
    const errorMessage = (error as Error).message;
    const errorStack = (error as Error).stack;
    console.error('Error details:', { errorMessage, errorStack });
    // Don't throw error to allow tests to continue
  }
}
