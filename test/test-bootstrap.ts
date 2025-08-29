import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cors from 'cors';

export async function bootstrapTestApp(app: INestApplication): Promise<void> {
  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();
  app.use(helmet());
  app.use(cors());

  // Swagger documentation setup - setup before global prefix
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

  // Set global prefix after Swagger setup
  app.setGlobalPrefix('api');
}
