/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import request from 'supertest';
import { setupTestApp, teardownTestApp, TestAppSetup } from './test-utils';

describe('Products E2E', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let testData: any;

  beforeAll(async () => {
    const setup: TestAppSetup = await setupTestApp();
    app = setup.app;
    sequelize = setup.sequelize;
    testData = setup.testData;
  });

  afterAll(async () => {
    await teardownTestApp(app, sequelize);
  });

  describe('/v1/products (GET) - Get All Products', () => {
    it('should return all products with categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.message).toBe('Products retrieved successfully');

      // Verify each product has required properties
      response.body.data.forEach((product: any) => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('category');
        expect(product.category).toHaveProperty('id');
        expect(product.category).toHaveProperty('name');
        expect(product.category).toHaveProperty('description');
        expect(product).not.toHaveProperty('categoryId'); // Should be excluded
      });
    });

    it('should return products ordered by creation date ascending', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);

      if (response.body.data.length > 1) {
        const products = response.body.data;
        for (let i = 1; i < products.length; i++) {
          const prevDate = new Date(products[i - 1].createdAt);
          const currDate = new Date(products[i].createdAt);
          expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
          expect(products[i].name).toBeDefined();
          expect(products[i].price).toBeDefined();
          expect(products[i].category).toBeDefined();
          expect(products[i].category).toHaveProperty('name');
          expect(products[i].category).toHaveProperty('description');
          expect(products[i].category).toHaveProperty('id');
        }
      }
    });

    it('should include specific test products', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products')
        .expect(200);

      const productNames = response.body.data.map((p: any) => p.name);
      expect(productNames).toContain('Basic Health Plan');
      expect(productNames).toContain('Premium Health Plan');
      expect(productNames).toContain('Car Insurance');
    });

    it('should include category details for each product', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products')
        .expect(200);

      const healthProducts = response.body.data.filter(
        (p: any) => p.category.name === 'Health Insurance',
      );
      const autoProducts = response.body.data.filter(
        (p: any) => p.category.name === 'Auto Insurance',
      );

      expect(healthProducts.length).toBeGreaterThan(0);
      expect(autoProducts.length).toBeGreaterThan(0);
    });
  });

  describe('/v1/products/categories (GET) - Get All Categories', () => {
    it('should return all product categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products/categories')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.message).toBe(
        'Product categories retrieved successfully',
      );

      // Verify each category has required properties
      response.body.data.forEach((category: any) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
      });
    });

    it('should return categories ordered by ID ascending', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products/categories')
        .expect(200);

      if (response.body.data.length > 1) {
        const categories = response.body.data;
        for (let i = 1; i < categories.length; i++) {
          expect(categories[i].id).toBeGreaterThanOrEqual(categories[i - 1].id);
        }
      }
    });

    it('should include specific test categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products/categories')
        .expect(200);

      const categoryNames = response.body.data.map((c: any) => c.name);
      expect(categoryNames).toContain('Health Insurance');
      expect(categoryNames).toContain('Auto Insurance');
    });

    it('should return consistent category data', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products/categories')
        .expect(200);

      const healthCategory = response.body.data.find(
        (c: any) => c.name === 'Health Insurance',
      );
      expect(healthCategory).toBeDefined();
      expect(healthCategory.description).toBe('Health and medical coverage');
    });
  });

  describe('/v1/products/:id (GET) - Get Product by ID', () => {
    it('should return product by valid ID', async () => {
      const productId = testData.products[0].id;

      const response = await request(app.getHttpServer())
        .get(`/v1/products/${productId}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('price');
      expect(response.body.data).toHaveProperty('category');
      expect(response.body.data.category).toHaveProperty('id');
      expect(response.body.data.category).toHaveProperty('name');
      expect(response.body.data.category).toHaveProperty('description');
      expect(response.body.data).not.toHaveProperty('categoryId');
      expect(response.body.message).toBe('Product retrieved successfully');
    });

    it('should return specific product details correctly', async () => {
      const basicHealthPlan = testData.products.find(
        (p: any) => p.name === 'Basic Health Plan',
      );

      const response = await request(app.getHttpServer())
        .get(`/v1/products/${basicHealthPlan.id}`)
        .expect(200);

      expect(response.body.data.name).toBe('Basic Health Plan');
      expect(Number(response.body.data.price)).toBe(100);
      expect(response.body.data.category.name).toBe('Health Insurance');
    });

    it('should return null for non-existent product ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products/999')
        .expect(200);

      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Product retrieved successfully');
    });

    it('should return 400 for invalid ID parameter', async () => {
      await request(app.getHttpServer())
        .get('/v1/products/invalid')
        .expect(400);
    });

    it('should include complete category information', async () => {
      const premiumHealthPlan = testData?.products?.find(
        (p: any) => p.name === 'Premium Health Plan',
      );

      const response = await request(app.getHttpServer())
        .get(`/v1/products/${premiumHealthPlan.id}`)
        .expect(200);

      expect(response.body.data.category).toHaveProperty('id');
      expect(response.body.data.category).toHaveProperty('name');
      expect(response.body.data.category).toHaveProperty('description');
      expect(response.body.data.category.name).toBe('Health Insurance');
      expect(response.body.data.category.description).toBe(
        'Health and medical coverage',
      );
    });

    it('should return auto insurance product correctly', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const carInsurance = testData.products.find(
        (p: any) => p.name === 'Car Insurance',
      );

      const response = await request(app.getHttpServer())
        .get(`/v1/products/${carInsurance.id}`)
        .expect(200);

      expect(response.body.data.name).toBe('Car Insurance');
      expect(Number(response.body.data.price)).toBe(150);
      expect(response.body.data.category.name).toBe('Auto Insurance');
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent product prices across endpoints', async () => {
      const allProductsResponse = await request(app.getHttpServer())
        .get('/v1/products')
        .expect(200);

      const product = allProductsResponse.body.data[0];

      const singleProductResponse = await request(app.getHttpServer())
        .get(`/v1/products/${product.id}`)
        .expect(200);

      expect(singleProductResponse.body.data.price).toBe(product.price);
      expect(singleProductResponse.body.data.name).toBe(product.name);
    });

    it('should have consistent category data across endpoints', async () => {
      const categoriesResponse = await request(app.getHttpServer())
        .get('/v1/products/categories')
        .expect(200);

      const productsResponse = await request(app.getHttpServer())
        .get('/v1/products')
        .expect(200);

      const category = categoriesResponse.body.data[0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const productWithSameCategory = productsResponse.body.data.find(
        (p: any) => p.category.id === category.id,
      );

      if (productWithSameCategory) {
        expect(productWithSameCategory.category.name).toBe(category.name);
        expect(productWithSameCategory.category.description).toBe(
          category.description,
        );
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle very large product IDs gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products/999999')
        .expect(200);

      expect(response.body.data).toBeNull();
    });
  });
});
