import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './exeption-filters/all-exceptions.filter';
import { GlobalHttpExceptionFilter } from './exeption-filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
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

  // Register request ID middleware
  app.use(RequestIdMiddleware);

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  
  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  const port = configService.get<string>('port');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Armenia Tour Booking - Main API')
    .setDescription(`
      Main API Service for Armenia Tour Booking Platform
      
      This is the primary API service that handles all client requests including user management, 
      authentication, and business logic. It serves as the main entry point for the application.
      
      ## Authentication
      This API uses JWT tokens for authentication. The authentication flow works as follows:
      
      1. **Sign Up**: Create a new account and receive access + refresh tokens
      2. **Sign In**: Authenticate and receive new access + refresh tokens
      3. **Refresh Token**: Use refresh token to get new access token when it expires
      4. **Logout**: Invalidate refresh token to log out
      
      ## Token Security
      - **Access Tokens**: Short-lived (15 minutes) for API access
      - **Refresh Tokens**: Long-lived (7 days) for token renewal
      - **Token Rotation**: New refresh token generated on each refresh
      - **Secure Storage**: Refresh tokens stored securely in database
      
      ## Features
      - User registration and authentication
      - Password reset and account verification
      - Two-factor authentication (2FA)
      - Role-based access control
      - Request logging and error handling
      - Swagger API documentation
    `)
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  
  logger.log(`API service started successfully on port ${port}`, {
    service: 'API Service',
    port,
    environment: process.env.NODE_ENV || 'development',
  });
}
bootstrap();
