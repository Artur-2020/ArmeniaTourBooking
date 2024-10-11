import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { SignInDto, SignUpDto } from '../auth/dto';
import { signUpReturn, signInReturn } from './interfaces/auth';
import { AuthService } from './auth.service';
import { ValidationPipe } from '../users/pipes/validation.pipe';

@Controller('auth')
@UsePipes(ValidationPipe)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @MessagePattern({ cmd: 'sign_up' })
  async createUser(@Payload() data: SignUpDto): Promise<signUpReturn> {
    try {
      return await this.authService.signUp(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
  @MessagePattern({ cmd: 'sign_in' })
  async signIn(@Payload() data: SignInDto): Promise<signInReturn> {
    try {
      return await this.authService.signIn(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
