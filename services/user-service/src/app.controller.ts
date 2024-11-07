import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'get_users' })
  getUsers() {
    return [{ id: 1, name: 'Арт Doe' }];
  }
  @MessagePattern({ cmd: 'say' })
  say(@Payload() data: string) {
    console.log('data ===>', data);
    return 'Hello Bro';
  }
}
