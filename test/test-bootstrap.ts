import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../src/app.module';

export async function bootstrapTestApp(): Promise<{
  app: INestApplication;
  sequelize: Sequelize;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const sequelize = app.get<Sequelize>('SEQUELIZE');

  await app.init();

  return { app, sequelize };
}

export async function cleanupTestApp(
  app: INestApplication,
  sequelize: Sequelize,
): Promise<void> {
  try {
    await sequelize.close();
    await app.close();
  } catch (error: unknown) {
    console.error('Error during test cleanup:', error);
    throw error;
  }
}
