import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { Sequelize } from 'sequelize-typescript';
import { seedTestData } from './test-seed';
import { bootstrapTestApp } from './test-bootstrap';

describe('AppController (e2e)', () => {
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

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect((res) => {
        // Just check that we get a response
        expect(res.body).toBeDefined();
        console.log('Response body:', JSON.stringify(res.body, null, 2));
      });
  });

  it('/docs (GET)', () => {
    return request(app.getHttpServer()).get('/docs').expect(200); // Swagger documentation should be accessible at /docs (not /api/docs)
  });

  it('should have proper CORS headers', () => {
    return request(app.getHttpServer())
      .options('/api/v1/products')
      .expect(204) // OPTIONS request returns 204 No Content
      .expect('Access-Control-Allow-Origin', '*');
  });
});
