import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { RpcException, BaseRpcExceptionFilter } from '@nestjs/microservices';
import { ValidationPipe } from './users/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global ValidationPipe for HTTP server
  app.useGlobalPipes(new ValidationPipe());

  // Microservice options for RabbitMQ
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('rabbitmqUrl')],
      queue: 'user_queue',
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

  // Global filter for handling RPC exceptions
  microserviceApp.useGlobalFilters(new BaseRpcExceptionFilter());

  // Start microservices
  await app.startAllMicroservices();

  // Start HTTP server after microservices
  await app.listen(3000);
  console.log('Main application and microservice are running');
}

bootstrap();
