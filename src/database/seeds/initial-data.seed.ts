import { ProductCategory } from '../../models/product-category.model';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';

export async function seedInitialData() {
  try {
    // Create Product Categories
    const healthCategory = await ProductCategory.create({
      name: 'Health',
      description: 'Health insurance products',
    });

    const autoCategory = await ProductCategory.create({
      name: 'Auto',
      description: 'Auto insurance products',
    });

    // Create Products
    await Product.create({
      name: 'Optimal Care Mini',
      price: 10000.00,
      category_id: healthCategory.id,
    });

    await Product.create({
      name: 'Optimal Care Standard',
      price: 20000.00,
      category_id: healthCategory.id,
    });

    await Product.create({
      name: 'Third-Party',
      price: 5000.00,
      category_id: autoCategory.id,
    });

    await Product.create({
      name: 'Comprehensive',
      price: 15000.00,
      category_id: autoCategory.id,
    });

    // Create Sample Users
    await User.create({
      name: 'John Doe',
      wallet_balance: 100000.00,
    });

    await User.create({
      name: 'Jane Smith',
      wallet_balance: 75000.00,
    });

    await User.create({
      name: 'Bob Johnson',
      wallet_balance: 50000.00,
    });

    console.log('✅ Initial data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
    throw error;
  }
}
