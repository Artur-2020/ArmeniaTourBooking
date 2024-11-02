import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  SignInDto,
  SignUpDto,
  ResendVerificationDto,
  VerifyAccountDto,
} from '../auth/dto';
import { signUpReturn, signInReturn, BasicReturnType } from './interfaces/auth';
import { AuthService } from './auth.service';
import { ValidationPipe } from '../users/pipes/validation.pipe';
import { VerificationEntityType } from './constants/auth';

@Controller('auth')
@UsePipes(ValidationPipe)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @MessagePattern({ cmd: 'sign_up' })
  async signUp(@Payload() data: SignUpDto): Promise<signUpReturn> {
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

  @MessagePattern({ cmd: 'resend_verification_code' })
  async resendVerificationCode(
    @Payload() data: ResendVerificationDto,
  ): Promise<BasicReturnType<null>> {
    try {
      const newData = { ...data, type: VerificationEntityType.VERIFY_ACCOUNT };
      await this.authService.resendCode(newData);
      return { success: true };
    } catch (error) {
      console.log('error ------------>', error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'reset_password_code' })
  async sendForgetPasswordCode(
    @Payload() data: ResendVerificationDto,
  ): Promise<BasicReturnType<null>> {
    try {
      const newData = { ...data, type: VerificationEntityType.RESETPASSWORD };
      await this.authService.resendCode(newData);
      return { success: true };
    } catch (error) {
      console.log('error ------------>', error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'verify_account' })
  async verifyAccount(
    @Payload() data: VerifyAccountDto,
  ): Promise<BasicReturnType<null>> {
    try {
      const { token } = data;
      await this.authService.verifyAccount(token);
      return { success: true };
    } catch (error) {
      console.log('error ------------>', error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'verify_reset_password_code' })
  async verifyResetPasswordCode(
    @Payload() data: VerifyAccountDto,
  ): Promise<BasicReturnType<null>> {
    try {
      const { token } = data;
      await this.authService.verifyResetPasswordCode(token);
      return { success: true };
    } catch (error) {
      console.log('error ------------>', error);
      throw new RpcException(error.message);
    }
  }
}
