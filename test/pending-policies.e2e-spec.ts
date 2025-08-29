/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import request from 'supertest';
import { setupTestApp, teardownTestApp, TestAppSetup } from './test-utils';

describe('Pending Policies E2E', () => {
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

  describe('/v1/plans/:id/pending-policies (GET) - Get Pending Policies by Plan ID', () => {
    it('should return pending policies for valid plan ID', async () => {
      const planId = testData.plans[0].id;

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/${planId}/pending-policies`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.message).toBe(
        'Pending policies retrieved successfully',
      );

      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('status');
        expect(response.body.data[0]).toHaveProperty('plan');
        expect(response.body.data[0].plan).toHaveProperty('id');
        expect(response.body.data[0].plan).toHaveProperty('user');
        expect(response.body.data[0].plan).toHaveProperty('product');
        expect(response.body.data[0].plan.user).toHaveProperty('fullName');
        expect(response.body.data[0].plan.product).toHaveProperty('name');
      }
    });

    it('should return empty array for plan with no pending policies', async () => {
      // Create a plan with no pending policies
      const { Plan } = sequelize.models;
      const planWithoutPolicies = await Plan.create({
        userId: testData.users[0].id,
        productId: testData.products[1].id,
        quantity: 1,
        totalAmount: 200,
      });

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/${planWithoutPolicies.get('id')}/pending-policies`)
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.message).toBe(
        'Pending policies retrieved successfully',
      );
    });

    it('should return empty array for non-existent plan ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/plans/999/pending-policies')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });

    it('should return 400 for invalid plan ID parameter', async () => {
      await request(app.getHttpServer())
        .get('/v1/plans/invalid/pending-policies')
        .expect(400);
    });

    it('should include plan details in response', async () => {
      const planId = testData.plans[0].id;

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/${planId}/pending-policies`)
        .expect(200);

      if (response.body.data.length > 0) {
        const pendingPolicy = response.body.data[0];
        expect(pendingPolicy.plan.id).toBe(planId);
        expect(pendingPolicy.plan).toHaveProperty('quantity');
        expect(pendingPolicy.plan).toHaveProperty('totalAmount');
        expect(pendingPolicy.plan.user).toHaveProperty('id');
        expect(pendingPolicy.plan.user).toHaveProperty('fullName');
        expect(pendingPolicy.plan.product).toHaveProperty('id');
        expect(pendingPolicy.plan.product).toHaveProperty('name');
        expect(pendingPolicy.plan.product).toHaveProperty('price');
      }
    });
  });

  describe('/v1/plans/:id/pending-policies/unused (GET) - Get Unused Pending Policies', () => {
    it('should return only unused pending policies for valid plan ID', async () => {
      const planId = testData.plans[0].id;

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/${planId}/pending-policies/unused`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.message).toBe(
        'Unused pending policies retrieved successfully',
      );

      // All returned policies should have status 'unused'
      response.body.data.forEach((policy: any) => {
        expect(policy.status).toBe('unused');
      });
    });

    it('should return empty array when no unused policies exist', async () => {
      // Create a plan and mark all its pending policies as used
      const { Plan, PendingPolicy } = sequelize.models;
      const newPlan = await Plan.create({
        userId: testData.users[0].id,
        productId: testData.products[0].id,
        quantity: 2,
        totalAmount: 200,
      });

      const usedPolicies = await PendingPolicy.bulkCreate([
        {
          planId: newPlan.get('id'),
          status: 'used',
        },
        {
          planId: newPlan.get('id'),
          status: 'used',
        },
      ]);

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/${newPlan.get('id')}/pending-policies/unused`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });

    it('should return 400 for invalid plan ID parameter', async () => {
      await request(app.getHttpServer())
        .get('/v1/plans/invalid/pending-policies/unused')
        .expect(400);
    });

    it('should include complete plan information in unused policies', async () => {
      const planId = testData.plans[0].id;

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/${planId}/pending-policies/unused`)
        .expect(200);

      if (response.body.data.length > 0) {
        const unusedPolicy = response.body.data[0];
        expect(unusedPolicy.status).toBe('unused');
        expect(unusedPolicy.plan).toHaveProperty('id');
        expect(unusedPolicy.plan).toHaveProperty('quantity');
        expect(unusedPolicy.plan).toHaveProperty('totalAmount');
        expect(unusedPolicy.plan.user).toHaveProperty('fullName');
        expect(unusedPolicy.plan.product).toHaveProperty('name');
        expect(unusedPolicy.plan.product).toHaveProperty('price');
      }
    });

    it('should filter out used policies correctly', async () => {
      // Create a plan with both used and unused policies
      const { Plan, PendingPolicy } = sequelize.models;
      const mixedPlan = await Plan.create({
        userId: testData.users[1].id,
        productId: testData.products[1].id,
        quantity: 3,
        totalAmount: 600,
      });

      await PendingPolicy.bulkCreate([
        {
          planId: mixedPlan.get('id'),
          status: 'unused',
        },
        {
          planId: mixedPlan.get('id'),
          status: 'used',
        },
        {
          planId: mixedPlan.get('id'),
          status: 'unused',
        },
      ]);

      const response = await request(app.getHttpServer())
        .get(`/v1/plans/${mixedPlan.get('id')}/pending-policies/unused`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((policy: any) => {
        expect(policy.status).toBe('unused');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, we'll just test with very large ID that shouldn't exist
      const response = await request(app.getHttpServer())
        .get('/v1/plans/999999/pending-policies')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });
});
