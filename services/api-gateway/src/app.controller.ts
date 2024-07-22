import { Controller, Get, Post, Body } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('BOOKING_SERVICE') private readonly bookingClient: ClientProxy,
  ) {}

  @Post('signup')
  getUsers(@Body() data: { role: string, email: string, password: string }) {
    return this.usersClient.send({ cmd: 'sign_up' }, data);
  }

  @Get('bookings')
  getBookings() {
    return this.bookingClient.send({ cmd: 'get_bookings' }, {});
  }
}
