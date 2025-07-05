import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Transport,
  MicroserviceOptions,
  BaseRpcExceptionFilter,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from './pipes/validation.pipe';
import { AppLogger } from './utils/logger';
import { CustomRpcExceptionFilter } from './exceptions/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(AppLogger);

  // Global ValidationPipe for HTTP server
  app.useGlobalPipes(new ValidationPipe());

  // Microservice options for RabbitMQ
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('rabbitmqUrl')],
      queue: 'notification_queue',
      queueOptions: {
        durable: false,
      },
    },
  };

  // Connect microservice
  const microserviceApp =
    app.connectMicroservice<MicroserviceOptions>(microserviceOptions);

  // Global ValidationPipe for microservice
  microserviceApp.useGlobalPipes(new ValidationPipe());

  // Global filter for handling RPC exceptions with logging
  microserviceApp.useGlobalFilters(new CustomRpcExceptionFilter());

  // Start microservices
  await app.startAllMicroservices();

  const port = configService.get<string>('port');
  // Start HTTP server after microservices
  await app.listen(port);
  
  logger.log(`Notification service started successfully on port ${port}`, {
    service: 'Notification Service',
    port,
    environment: process.env.NODE_ENV || 'development',
  });
}

bootstrap();
