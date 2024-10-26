import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Transport,
  MicroserviceOptions,
  BaseRpcExceptionFilter,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from './pipes/validation.pipe';

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

  // Global filter for handling RPC exceptions
  microserviceApp.useGlobalFilters(new BaseRpcExceptionFilter());

  // Start microservices
  await app.startAllMicroservices();

  const port = configService.get<string>('port');
  // Start HTTP server after microservices
  await app.listen(port);
  console.log(
    `Main application and microservice are running for notifications service on port ${port}`,
  );
}

bootstrap();
