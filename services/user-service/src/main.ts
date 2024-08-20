import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global ValidationPipe for HTTP server with custom exception factory
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const errorMessages = errors.map(err => ({
            field: err.property,
            errors: Object.values(err.constraints)
          }));
          return new BadRequestException(errorMessages);
        },
      }),
  );

  const configService = app.get(ConfigService);

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
  const microserviceApp = app.connectMicroservice<MicroserviceOptions>(microserviceOptions);

  // Global ValidationPipe for microservice with custom exception factory
  microserviceApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const errorMessages = errors.map(err => ({
            field: err.property,
            errors: Object.values(err.constraints)
          }));
          return new RpcException({ statusCode: 400, message: errorMessages });
        },
      }),
  );

  // Global filter for handling RPC exceptions
  microserviceApp.useGlobalFilters(new BaseRpcExceptionFilter());

  // Start microservices
  await app.startAllMicroservices();

  // Start HTTP server after microservices
  await app.listen(3000);
  console.log('Main application and microservice are running');
}

bootstrap();
