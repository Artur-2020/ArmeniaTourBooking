import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AllExceptionsFilter } from './exeption-filters/all-exceptions.filter';
import { GlobalHttpExceptionFilter } from './exeption-filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AppLogger } from './utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(AppLogger);

  // Enable validation with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = errors.map((err) => ({
          field: err.property,
          errors: Object.values(err.constraints),
        }));
        return new BadRequestException({
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          errors: errorMessages,
        });
      },
    }),
  );

  // Enable CORS
  app.enableCors();

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  
  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  const port = configService.get<string>('port');
  await app.listen(port);
  
  logger.log(`User service started successfully on port ${port}`, {
    service: 'User Service',
    port,
    environment: process.env.NODE_ENV || 'development',
  });
}
bootstrap();
