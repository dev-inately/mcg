import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cors from 'cors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('Starting MyCoverGenius application...');
  
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  logger.log('Validation pipes configured');

  // Enable CORS
  app.enableCors();
  // app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors();
  app.use(cors());

  logger.log('Security middleware configured (CORS, Helmet)');

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
  SwaggerModule.setup('api', app, document);

  logger.log('Swagger documentation configured');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation available at: http://localhost:${port}/api`);
  logger.log(`🔍 Logging level: ${process.env.LOG_LEVEL || 'info'}`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
