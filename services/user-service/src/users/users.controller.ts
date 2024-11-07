import { Controller, UsePipes } from '@nestjs/common';
import { ValidationPipe } from './pipes/validation.pipe';
@Controller()
@UsePipes(ValidationPipe)
export class UserController {
  constructor() {}
  // @MessagePattern({ cmd: 'sign_up' })
}
