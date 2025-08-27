import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import appConfig from './app.config';
import loggingConfig from './logging.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, loggingConfig],
      envFilePath: '.env',
    }),
  ],
})
export class AppConfigModule {}
