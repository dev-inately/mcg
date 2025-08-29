import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

export const createTestingModule = async () => {
  return await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test',
        isGlobal: true,
      }),
      AppModule,
    ],
  }).compile();
};

export const TEST_CONFIG = {
  database: {
    dialect: 'sqlite',
    storage: ':memory:',
    autoLoadModels: true,
    synchronize: true,
    logging: false,
  },
  app: {
    port: 3001, // Different port for testing
  },
  timeout: 30000,
};
