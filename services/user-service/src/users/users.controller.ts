import { Controller, UsePipes } from '@nestjs/common';
import { ValidationPipe } from './pipes/validation.pipe';
import { UserService } from './users.service';
import { SignUpDto } from './dto/signup.dto';
import { User } from './entities/user.entity';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
@Controller()
@UsePipes(ValidationPipe)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @MessagePattern({ cmd: 'sign_up' })
  async createUser(@Payload() data: SignUpDto): Promise<User> {
    try {
      return await this.userService.signUp(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
