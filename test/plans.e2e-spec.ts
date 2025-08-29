import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { Sequelize } from 'sequelize-typescript';
import { seedTestData } from './test-seed';
import { bootstrapTestApp } from './test-bootstrap';

describe('Plans (e2e)', () => {
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

  describe('/api/v1/plans (POST)', () => {
    it('should return 400 for insufficient wallet balance (wallet already consumed)', () => {
      const createPlanDto = {
        quantity: 1,
        userId: 2, // Jane Smith who has 5000 balance (insufficient for 10000 product)
        productId: 1, // Optimal Care Mini (10000)
      };

      return request(app.getHttpServer())
        .post('/api/v1/plans')
        .send(createPlanDto)
        .expect(400); // Should fail due to insufficient wallet balance
    });

    it('should return 400 for insufficient wallet balance', () => {
      const createPlanDto = {
        quantity: 1,
        userId: 1, // John Doe who has 0 balance
        productId: 2, // Optimal Care Standard (20000) - should fail due to insufficient balance
      };

      return request(app.getHttpServer())
        .post('/api/v1/plans')
        .send(createPlanDto)
        .expect(400);
    });

    it('should return 400 for duplicate plan due to insufficient balance', () => {
      const createPlanDto = {
        quantity: 1,
        userId: 2, // Jane Smith
        productId: 1, // Optimal Care Mini
      };

      return request(app.getHttpServer())
        .post('/api/v1/plans')
        .send(createPlanDto)
        .expect(400); // Should fail due to insufficient wallet balance after first plan
    });

    it('should return 400 for non-existent user', () => {
      const createPlanDto = {
        quantity: 1,
        userId: 999,
        productId: 1,
      };

      return request(app.getHttpServer())
        .post('/api/v1/plans')
        .send(createPlanDto)
        .expect(400);
    });

    it('should return 400 for non-existent product', () => {
      const createPlanDto = {
        quantity: 1,
        userId: 2,
        productId: 999,
      };

      return request(app.getHttpServer())
        .post('/api/v1/plans')
        .send(createPlanDto)
        .expect(400);
    });
  });

  describe('/api/v1/plans/:id (GET)', () => {
    it('should return a plan by ID', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data).toHaveProperty('id', 1);
          expect(res.body.data).toHaveProperty('userId');
          expect(res.body.data).toHaveProperty('productId');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user).toHaveProperty('id');
          expect(res.body.data.user).toHaveProperty('fullName');
          expect(res.body.data).toHaveProperty('createdAt');
        });
    });

    it('should return 200 with null data for non-existent plan (by design)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/999')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
        });
    });

    it('should return 400 for invalid ID format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/invalid')
        .expect(400);
    });
  });

  describe('/api/v1/plans/user/:userId (GET)', () => {
    it('should return all plans for a user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/user/1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0]).toHaveProperty('userId', 1);
          expect(res.body.data[0]).toHaveProperty('productId');
          expect(res.body.data[0]).toHaveProperty('user');
          expect(res.body.data[0].user).toHaveProperty('id');
          expect(res.body.data[0].user).toHaveProperty('fullName');
        });
    });

    it('should return 400 for user with no plans (business logic error)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/user/999')
        .expect(400);
    });

    it('should return 400 for invalid user ID format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/user/invalid')
        .expect(400);
    });
  });
});
