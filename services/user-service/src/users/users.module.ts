import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UserRepository } from './repsitories';
import { User } from './entities';
import { Verification } from '../auth/entities';
import { VerificationRepository } from '../auth/repositories';
import { UserController } from './users.controller';
import { APP_FILTER } from '@nestjs/core';
import { RpcExceptionFilter } from './exeption-filters/rpc.exeption-filter';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Verification]),
    JwtModule.register({}), // Обязательно добавляем JwtModule, если используете JwtService
  ],
  controllers: [UserController],
  providers: [
    UserService,
    JwtService,
    UserRepository,
    ConfigService,
    VerificationRepository,
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter,
    },
  ],
  exports: [
    UserService,
    JwtService,
    UserRepository,
    ConfigService,
    VerificationRepository,
  ],
})
export class UserModule {}
