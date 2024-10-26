import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'say' })
  say(@Payload() data: string) {
    return 'Hello Bro';
  }
}
