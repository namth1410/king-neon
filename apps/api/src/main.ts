import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parser for auth cookies
  app.use(cookieParser());

  // Enable CORS for frontend apps
  app.enableCors({
    origin: (
      process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001'
    ).split(','),
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('King Neon API')
    .setDescription('API documentation for King Neon e-commerce platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('products', 'Product catalog')
    .addTag('neon-config', 'Neon sign configuration options')
    .addTag('neon-designs', 'Custom neon sign designs')
    .addTag('orders', 'Order management')
    .addTag('quotes', 'Quote requests for businesses')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 API is running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
void bootstrap();
