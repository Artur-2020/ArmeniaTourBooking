import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities';
import { Verification, UserSettings, TwoFactor } from './auth/entities';
import { UserModule } from './users/users.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './exeption-filters/all-exceptions.filter';
import { GlobalHttpExceptionFilter } from './exeption-filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AuthService } from './auth/auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ResetPasswordService } from './auth/reset-password/reset-password.service';
import { ResetPasswordController } from './auth/reset-password/reset-password.controller';
import { TwoFactorController } from './auth/two-factor/two-factor.controller';
import { TwoFactorService } from './auth/two-factor/two-factor.service';
import { SharedService } from './auth/shared/shared.service';
import { TokensService } from './auth/tokens/tokens.service';
import { AuthController } from './auth/auth.controller';
import { typeOrmConfig } from './config/typeorm.config';
import configuration from './config/config';
import { AuthModule } from './auth/auth.module';
import { AppLogger } from './utils/logger';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        typeOrmConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Verification, UserSettings, TwoFactor]),
    UserModule,
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmqUrl')],
            queue: 'notification_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController, ResetPasswordController, TwoFactorController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    AppLogger,
    AuthService,
    ResetPasswordService,
    TwoFactorService,
    SharedService,
    TokensService,
  ],
})
export class AppModule {}
