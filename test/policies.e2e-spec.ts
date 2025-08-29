/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import request from 'supertest';
import { setupTestApp, teardownTestApp, TestAppSetup } from './test-utils';

describe('Policies E2E', () => {
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

  describe('/v1/policies (POST) - Activate Pending Policy', () => {
    it('should activate a pending policy successfully', async () => {
      const activateDto = {
        pendingPolicyId: testData.pendingPolicies[0].id,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/policies/activate')
        .send(activateDto)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('policyNumber');
      expect(response.body.data.userId).toBe(testData.users[0].id);
      expect(response.body.data.product.name).toBe('Basic Health Plan');
      expect(response.body.message).toBe(
        'Insurance policy activated successfully',
      );
    });

    it('should activate pending policy for different user', async () => {
      const activateDto = {
        pendingPolicyId: testData.pendingPolicies[1].id,
        userId: testData.users[1].id,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/policies/activate')
        .send(activateDto)
        .expect(201);

      expect(response.body.data.userId).toBe(testData.users[1].id);
    });

    it('should return 400 when pending policy not found', async () => {
      const activateDto = {
        pendingPolicyId: 999,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/policies/activate')
        .send(activateDto)
        .expect(400);

      expect(response.body.message).toContain('not found');
    });

    it('should return 400 when user not found', async () => {
      // First create a new pending policy for testing
      const { PendingPolicy, Plan } = sequelize.models;
      const newPlan = await Plan.create({
        userId: testData.users[0].id,
        productId: testData.products[0].id,
        quantity: 1,
        totalAmount: 100,
      });
      const newPendingPolicy = await PendingPolicy.create({
        planId: newPlan.get('id'),
        status: 'unused',
      });

      const activateDto = {
        pendingPolicyId: newPendingPolicy.get('id'),
        userId: 999,
      };

      await request(app.getHttpServer())
        .post('/v1/policies/activate')
        .send(activateDto)
        .expect(400);
    });

    it('should return 400 when pending policy already used', async () => {
      // Create and immediately activate a pending policy
      const { PendingPolicy, Plan, Policy } = sequelize.models;
      const newPlan = await Plan.create({
        userId: testData.users[0].id,
        productId: testData.products[1].id,
        quantity: 1,
        totalAmount: 200,
      });
      const pendingPolicy = await PendingPolicy.create({
        planId: newPlan.get('id'),
        status: 'used',
      });

      const activateDto = {
        pendingPolicyId: pendingPolicy.get('id'),
      };

      const response = await request(app.getHttpServer())
        .post('/v1/policies/activate')
        .send(activateDto)
        .expect(400);

      expect(response.body.message).toContain('already been used');
    });

    it('should validate request body', async () => {
      await request(app.getHttpServer())
        .post('/v1/policies/activate')
        .send({})
        .expect(400);
    });
  });

  describe('/v1/policies (GET) - Get All Policies', () => {
    it('should return all policies', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/policies')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.message).toBe(
        'Insurance policies retrieved successfully',
      );

      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('policyNumber');
        expect(response.body.data[0]).toHaveProperty('user');
        expect(response.body.data[0]).toHaveProperty('product');
      }
    });

    it('should return policies filtered by planId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/policies?planId=${testData.plans[0].id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((policy: any) => {
        expect(policy.planId).toBe(testData.plans[0].id);
      });
    });

    it('should return empty array when no policies match filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/policies?planId=999')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('/v1/policies/:id (GET) - Get Policy by ID', () => {
    it('should return policy by valid ID', async () => {
      // First activate a policy to ensure we have one to query
      const { Policy } = sequelize.models;
      const policies = await Policy.findAll({ limit: 1 });

      if (policies.length > 0) {
        const policyId = policies[0].get('id');

        const response = await request(app.getHttpServer())
          .get(`/v1/policies/${policyId}`)
          .expect(200);

        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.id).toBe(policyId);
        expect(response.body.data).toHaveProperty('policyNumber');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data).toHaveProperty('product');
        expect(response.body.message).toBe(
          'Insurance policy retrieved successfully',
        );
      }
    });

    it('should return 404 when policy not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/policies/999')
        .expect(404);

      expect(response.body.message).toBe('Policy with ID 999 not found');
    });

    it('should return 400 for invalid ID parameter', async () => {
      await request(app.getHttpServer())
        .get('/v1/policies/invalid')
        .expect(400);
    });
  });
});
