import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './exeption-filters/all-exceptions.filter';
import { AppLogger } from './utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(AppLogger);
  
  // Register global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
  
  const port = configService.get<string>('port');
  
  await app.listen(port);
  
  logger.log(`API Gateway service started successfully on port ${port}`, {
    service: 'API Gateway',
    port,
    environment: process.env.NODE_ENV || 'development',
  });
}
bootstrap();
