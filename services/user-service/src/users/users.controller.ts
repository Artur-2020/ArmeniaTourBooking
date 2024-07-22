import { Controller } from "@nestjs/common";
import { UserService } from './users.service';
import { SignUpDto } from './dto/signup.dto';
import { User } from './entities/user.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @MessagePattern({ cmd: 'sign_up' })
  async createUser(@Payload() data: SignUpDto): Promise<User> {
    return this.userService.signUp(data);
  }
}
