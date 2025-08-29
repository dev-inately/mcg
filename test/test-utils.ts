import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { seedTestDatabase, clearTestDatabase, TestData } from './test-seed';

export interface TestAppSetup {
  app: INestApplication;
  sequelize: Sequelize;
  testData: TestData;
}

export async function setupTestApp(): Promise<TestAppSetup> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const sequelize = app.get<Sequelize>(getConnectionToken());

  await app.init();

  // Sync database and seed test data
  await sequelize.sync({ force: true });
  const testData = await seedTestDatabase(sequelize);

  return { app, sequelize, testData };
}

export async function teardownTestApp(
  app: INestApplication,
  sequelize: Sequelize | null,
): Promise<void> {
  try {
    if (sequelize) {
      await clearTestDatabase(sequelize);
      await sequelize.close();
    }
    if (app) {
      await app.close();
    }
  } catch (error) {
    console.error('Error during teardown:', error);
    // Continue with cleanup
  }
}
