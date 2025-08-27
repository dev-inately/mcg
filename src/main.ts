import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS
  app.enableCors();

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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api`);
}
bootstrap();
