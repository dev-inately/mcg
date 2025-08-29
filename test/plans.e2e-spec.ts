/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import request from 'supertest';
import { setupTestApp, teardownTestApp, TestAppSetup } from './test-utils';

describe('Plans E2E', () => {
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

  describe('/v1/plans (POST) - Create Plan', () => {
    it('should create a plan successfully', async () => {
      const createPlanDto = {
        userId: testData.users[1].id,
        productId: testData.products[2].id,
        quantity: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/plans')
        .send(createPlanDto)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.userId).toBe(createPlanDto.userId);
      expect(response.body.data.productId).toBe(createPlanDto.productId);
      expect(response.body.data.quantity).toBe(createPlanDto.quantity);
      expect(Number(response.body.data.totalAmount)).toBe(150); // price * quantity
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.fullName).toBe('Jane Smith');
      expect(response.body.message).toBe('Insurance plan created successfully');

      // Verify pending policies were created
      const { PendingPolicy } = sequelize.models;
      const pendingPolicies = await PendingPolicy.findAll({
        where: { planId: response.body.data.id },
      });
      expect(pendingPolicies).toHaveLength(1);
    });

    it('should create plan with multiple quantity', async () => {
      const createPlanDto = {
        userId: testData.users[1].id,
        productId: testData.products[1].id,
        quantity: 2,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/plans')
        .send(createPlanDto)
        .expect(201);

      expect(response.body.data.quantity).toBe(2);
      expect(Number(response.body.data.totalAmount)).toBe(400); // 200 * 2

      // Verify correct number of pending policies created
      const { PendingPolicy } = sequelize.models;
      const pendingPolicies = await PendingPolicy.findAll({
        where: { planId: response.body.data.id },
      });
      expect(pendingPolicies).toHaveLength(2);
    });

    it('should return 400 when user not found', async () => {
      const createPlanDto = {
        userId: 999,
        productId: testData.products[0].id,
        quantity: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/plans')
        .send(createPlanDto)
        .expect(400);

      expect(response.body.message).toContain('not found');
    });

    it('should return 400 when product not found', async () => {
      const createPlanDto = {
        userId: testData.users[0].id,
        productId: 999,
        quantity: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/plans')
        .send(createPlanDto)
        .expect(400);

      expect(response.body.message).toContain('not found');
    });

    it('should return 400 when insufficient wallet balance', async () => {
      // User 2 has 500 in wallet, try to buy something costing 600
      const createPlanDto = {
        userId: testData.users[1].id,
        productId: testData.products[1].id, // Premium plan costs 200
        quantity: 4, // Total 800 > 500 wallet balance
      };

      const response = await request(app.getHttpServer())
        .post('/v1/plans')
        .send(createPlanDto)
        .expect(400);

      expect(response.body.message).toContain('Insufficient wallet balance');
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer()).post('/v1/plans').send({}).expect(400);
    });
    it('should create transaction record when plan is created', async () => {
      const initialTransactionCount =
        await sequelize.models.Transaction.count();

      const createPlanDto = {
        userId: testData.users[0].id,
        productId: testData.products[2].id, // Car insurance
        quantity: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/plans')
        .send(createPlanDto)
        .expect(201);

      const finalTransactionCount = await sequelize.models.Transaction.count();
      expect(finalTransactionCount).toBe(initialTransactionCount + 1);
    });
  });

  describe('/v1/plans/:id (GET) - Get Plan by ID', () => {
    it('should return plan by valid ID', async () => {
      const planId = testData.plans[0].id;

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/${planId}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(planId);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('productId');
      expect(response.body.data).toHaveProperty('quantity');
      expect(response.body.data).toHaveProperty('totalAmount');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('product');
      expect(response.body.message).toBe(
        'Insurance plan retrieved successfully',
      );
    });

    it('should return null for non-existent plan ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/plans/999')
        .expect(200);

      expect(response.body.data).toBeNull();
    });

    it('should return 400 for invalid ID parameter', async () => {
      await request(app.getHttpServer()).get('/v1/plans/invalid').expect(400);
    });

    it('should include user and product details', async () => {
      const planId = testData.plans[0].id;

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/${planId}`)
        .expect(200);

      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('fullName');
      expect(response.body.data.product).toHaveProperty('id');
      expect(response.body.data.product).toHaveProperty('name');
      expect(response.body.data.product).toHaveProperty('price');
      expect(response.body.data.product.category).toHaveProperty('name');
    });
  });

  describe('/v1/plans/user/:userId (GET) - Get Plans by User ID', () => {
    it('should return plans for valid user ID', async () => {
      const userId = testData.users[0].id;

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/user/${userId}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.message).toBe(
        'User insurance plans retrieved successfully',
      );

      response.body.data.forEach((plan: any) => {
        expect(plan.userId).toBe(userId);
        expect(plan).toHaveProperty('user');
        expect(plan).toHaveProperty('product');
      });
    });

    it('should return 400 when user not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/plans/user/999')
        .expect(400);

      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid user ID parameter', async () => {
      await request(app.getHttpServer())
        .get('/v1/plans/user/invalid')
        .expect(400);
    });

    it('should include complete plan details', async () => {
      const userId = testData.users[0].id;

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/user/${userId}`)
        .expect(200);

      if (response.body.data.length > 0) {
        const plan = response.body.data[0];
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('quantity');
        expect(plan).toHaveProperty('totalAmount');
        expect(plan.user).toHaveProperty('fullName');
        expect(plan.user).toHaveProperty('email');
        expect(plan.product).toHaveProperty('name');
        expect(plan.product).toHaveProperty('price');
        expect(plan.product.category).toHaveProperty('name');
      }
    });

    it('should return plans ordered by creation date ascending', async () => {
      const userId = testData.users[0].id;

      // Create multiple plans for the user
      const { Plan } = sequelize.models;
      await Plan.create({
        userId,
        productId: testData.products[1].id,
        quantity: 1,
        totalAmount: 200,
      });

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/user/${userId}`)
        .expect(200);

      if (response.body.data.length > 1) {
        const plans = response.body.data;
        for (let i = 1; i < plans.length; i++) {
          const prevDate = new Date(plans[i - 1].createdAt);
          const currDate = new Date(plans[i].createdAt);
          expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
        }
      }
    });
  });
});
