import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('rabbitmqUrl')],
      queue: 'booking_queue',
      queueOptions: {
        durable: false,
      },
    },
  };
  app.connectMicroservice<MicroserviceOptions>(microserviceOptions);
  await app.startAllMicroservices();
}

bootstrap();
