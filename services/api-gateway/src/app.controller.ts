import { Controller, Post, Body } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { SignUpDTO } from './dtos';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('BOOKING_SERVICE') private readonly bookingClient: ClientProxy,
  ) {}

  @Post('signup')
  getUsers(@Body() data: SignUpDTO) {
    return this.usersClient.send({ cmd: 'sign_up' }, data);
  }
}
