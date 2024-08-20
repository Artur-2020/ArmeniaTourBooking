import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UserRepository } from './repsitories/user.repository';
import { User } from './entities/user.entity';
import { UserController } from './users.controller';
import { APP_FILTER } from '@nestjs/core';
import { RpcExceptionFilter } from './exeption-filters/rpc.exeption-filter';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
