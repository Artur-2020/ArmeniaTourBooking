import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities';
import { Verification, UserSettings, TwoFactor } from '../auth/entities';
import { UserModule } from '../users/users.module';
import { APP_FILTER } from '@nestjs/core';
import { RpcExceptionFilter } from '../users/exeption-filters/rpc.exeption-filter';
import { AuthService } from './auth.service';
import { UserSettingsRepository, TwoFactorRepository } from './repositories';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ResetPasswordService } from './reset-password/reset-password.service';
import { ResetPasswordController } from './reset-password/reset-password.controller';
import { TwoFactorController } from './two-factor/two-factor.controller';
import { TwoFactorService } from './two-factor/two-factor.service';
import { SharedService } from './shared/shared.service';
import { TokensService } from './tokens/tokens.service';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
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
    TypeOrmModule.forFeature([User, Verification, UserSettings, TwoFactor]),
    UserModule,
  ],
  controllers: [AuthController, ResetPasswordController, TwoFactorController],
  providers: [
    AuthService, // Revert to simple provider definition
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter,
    },
    ResetPasswordService,
    TwoFactorService,
    SharedService,
    TokensService,
    UserSettingsRepository,
    TwoFactorRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    TwoFactorService,
    UserSettingsRepository,
    TwoFactorRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}

// providers: [AuthService, JwtAuthGuard, RolesGuard],
//     exports: [JwtAuthGuard, JwtModule, RolesGuard],
