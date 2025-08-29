import { Sequelize } from 'sequelize-typescript';
import { User } from '../src/models/user.model';
import { ProductCategory } from '../src/models/product-category.model';
import { Product } from '../src/models/product.model';
import { Wallet } from '../src/models/wallet.model';
import { Plan } from '../src/models/plan.model';
import { Policy } from '../src/models/policy.model';
import { PendingPolicy } from '../src/models/pending-policy.model';
import { Transaction } from '../src/models/transaction.model';

export class TestUtils {
  /**
   * Clean up all test data from the database
   */
  static async cleanupDatabase(sequelize: Sequelize): Promise<void> {
    try {
      // Delete in reverse order of dependencies
      await Transaction.destroy({ where: {}, force: true });
      await Policy.destroy({ where: {}, force: true });
      await PendingPolicy.destroy({ where: {}, force: true });
      await Plan.destroy({ where: {}, force: true });
      await Wallet.destroy({ where: {}, force: true });
      await User.destroy({ where: {}, force: true });
      await Product.destroy({ where: {}, force: true });
      await ProductCategory.destroy({ where: {}, force: true });
    } catch (error) {
      console.error('Error cleaning up database:', error);
    }
  }

  /**
   * Get a test user by email
   */
  static async getTestUser(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  /**
   * Get a test product by name
   */
  static async getTestProduct(name: string): Promise<Product | null> {
    return await Product.findOne({ where: { name } });
  }

  /**
   * Get a test product category by name
   */
  static async getTestProductCategory(
    name: string,
  ): Promise<ProductCategory | null> {
    return await ProductCategory.findOne({ where: { name } });
  }

  /**
   * Create a test plan for testing
   */
  static async createTestPlan(
    userId: number,
    productId: number,
  ): Promise<Plan> {
    return await Plan.create({
      userId,
      productId,
      status: 'active',
    });
  }

  /**
   * Create a test pending policy for testing
   */
  static async createTestPendingPolicy(planId: number): Promise<PendingPolicy> {
    return await PendingPolicy.create({
      planId,
      status: 'unused',
    });
  }
}
