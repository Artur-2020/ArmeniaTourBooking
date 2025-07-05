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
    .setTitle('Armenia Tour Booking API')
    .setDescription(`
      API Gateway for Armenia Tour Booking Microservices
      
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
    `)
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Health', 'Health check endpoints')
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
