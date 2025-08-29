import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { Sequelize } from 'sequelize-typescript';
import { seedTestData } from './test-seed';
import { bootstrapTestApp } from './test-bootstrap';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Bootstrap the app with middleware and Swagger
    await bootstrapTestApp(app);

    await app.init();

    // Get Sequelize instance for seeding
    sequelize = app.get(Sequelize);

    // Seed test database
    await seedTestData(sequelize);
  });

  afterAll(async () => {
    // Close app first, then database
    await app.close();
    // Note: Sequelize will be closed automatically when the app closes
  });

  describe('/api/v1/products (GET)', () => {
    it('should return all products', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0]).toHaveProperty('id');
          expect(res.body.data[0]).toHaveProperty('name');
          expect(res.body.data[0]).toHaveProperty('price');
          expect(res.body.data[0]).toHaveProperty('category');
          expect(res.body.data[0].category).toHaveProperty('id');
          expect(res.body.data[0].category).toHaveProperty('name');
        });
    });
  });

  describe('/api/v1/products/categories (GET)', () => {
    it('should return all product categories', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products/categories')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0]).toHaveProperty('id');
          expect(res.body.data[0]).toHaveProperty('name');
          expect(res.body.data[0]).toHaveProperty('description');
        });
    });
  });

  describe('/api/v1/products/:id (GET)', () => {
    it('should return a product by ID', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products/1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data).toHaveProperty('id', 1);
          expect(res.body.data).toHaveProperty('name');
          expect(res.body.data).toHaveProperty('price');
          expect(res.body.data).toHaveProperty('category');
          expect(res.body.data.category).toHaveProperty('id');
          expect(res.body.data.category).toHaveProperty('name');
        });
    });

    it('should return 200 with null data for non-existent product (by design)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products/999')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
        });
    });

    it('should return 400 for invalid ID format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products/invalid')
        .expect(400);
    });
  });
});
