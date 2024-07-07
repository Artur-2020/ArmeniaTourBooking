import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'get_bookings' })
  getBookings() {
    return [{ id: 1, user: 'John Doe', hotel: 'Hotel Armenia' }];
  }
}
