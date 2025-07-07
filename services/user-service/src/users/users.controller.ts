import { Controller, UsePipes, Get, Param } from '@nestjs/common';
import { ValidationPipe } from './pipes/validation.pipe';
import { UserService } from './users.service';

@Controller('users')
@UsePipes(ValidationPipe)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (user) {
      const { password, refreshToken, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }
}
