import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './exeption-filters/all-exceptions.filter';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { AppLogger } from './utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(AppLogger);
  
  // Register global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Register request ID middleware
  app.use(RequestIdMiddleware);
  
  const port = configService.get<string>('port');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Gateway Documentation')
    .setDescription('API Gateway for Microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(port);
  
  logger.log(`API Gateway service started successfully on port ${port}`, {
    service: 'API Gateway',
    port,
    environment: process.env.NODE_ENV || 'development',
  });
}
bootstrap();
