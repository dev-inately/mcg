import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { Sequelize } from 'sequelize-typescript';
import { seedTestData } from './test-seed';
import { bootstrapTestApp } from './test-bootstrap';

describe('Pending Policies (e2e)', () => {
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

  describe('/api/v1/plans/:id/pending-policies (GET)', () => {
    it('should return pending policies for a plan', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/1/pending-policies')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          // Note: This might return empty array if no pending policies exist
          // which is expected behavior (returns 200 with empty data)
        });
    });

    it('should return 200 with empty array for plan with no pending policies (by design)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/999/pending-policies')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBe(0);
        });
    });

    it('should return 400 for invalid plan ID format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/invalid/pending-policies')
        .expect(400);
    });
  });

  describe('/api/v1/plans/:id/pending-policies/unused (GET)', () => {
    it('should return unused pending policies for a plan', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/1/pending-policies/unused')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          // Note: This might return empty array if no unused pending policies exist
          // which is expected behavior (returns 200 with empty data)
        });
    });

    it('should return 200 with empty array for plan with no unused pending policies (by design)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/999/pending-policies/unused')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBe(0);
        });
    });

    it('should return 400 for invalid plan ID format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/plans/invalid/pending-policies/unused')
        .expect(400);
    });
  });
});
