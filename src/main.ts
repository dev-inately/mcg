import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { RequestLoggingInterceptor } from './common/interceptors';
import helmet from 'helmet';
import cors from 'cors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable global interceptors
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  // Enable CORS
  app.enableCors();
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors();
  app.use(cors());

  logger.log('Security middleware configured (CORS, Helmet)');
  logger.log(
    'Global interceptors configured (Request Logging, Response Duration)',
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('MyCoverGenius API')
    .setDescription('A mini insuretech API for insurance products and policies')
    .setVersion('1.0')
    .addTag('Products', 'Insurance product management')
    .addTag('Plans', 'Insurance plan management')
    .addTag('Pending Policies', 'Pending policy management')
    .addTag('Policies', 'Active policy management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  logger.log('Swagger documentation configured');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(
    `🚀 Application is running on: http://localhost:${port}. Environment: ${process.env.NODE_ENV}`,
  );
  logger.log(
    `📚 API Documentation available at: http://localhost:${port}/docs`,
  );
}
bootstrap();
