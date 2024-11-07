import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/config';
import { GlobalHttpExceptionFilter } from './exeption-filters/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmqUrl')],
            queue: 'user_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'BOOKING_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmqUrl')],
            queue: 'booking_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
